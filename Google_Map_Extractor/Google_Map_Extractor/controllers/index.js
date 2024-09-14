var ngApp = angular.module("popupApp", []).config(function ($sceProvider) {
    $sceProvider.enabled(false);
});

var ad = null
var remote_manifest = null
var download_link = null
var payment_link = null
var phone = null
var invalid_key_link = null

var columnList = ["keyword", "location", "company_name", "category", "website", "phone", "email_1", "email_2", "email_3", "lat", "long", "address", "city", "state", "pincode", "rating_count", "review", "cid"];
ngApp.controller("indexController", function ($scope, $http, $sce) {

    $scope.developer = DEVELOPER_INFO;
    $scope.manifest = chrome.runtime.getManifest();
    $scope.welcome = WelcomeController.model;
    $scope.Tabs = Tabs;
    $scope.$fc = FoxCommon;
    $scope.$auth = Auth;
    $scope.$config = Config;
    $scope.isCheckingLicense = false;
    $scope.invalidKey = false;
    $scope.version = CURRENT_VERSION;
    $scope.SOFTWARE_ID = SOFTWARE_ID;
    $scope.WEBSITE_ADDRESS = WEBSITE_ADDRESS;

    /* ------------------------------- Login Page ------------------------------- */
    $scope.loginPage = {
        email: "",
        password: "",
        isLoading: false,
    };

    /* ---------------------------------- Local --------------------------------- */
    $scope.local = $box.getDefaultLocalModel();

    /* ----------------------------- On Local Change ---------------------------- */
    $box.onLocalChange(data => {
        $box.getLocal(local => {
            $scope.$apply(() => {
                console.log(data)
                console.log("Data changed");

                emails.forEach((e) => {
                    let i = local.collect.findIndex(c => c.cid === e.cid)
                    if (i !== -1) {
                        local.collect[i].email_1 = e.email_1
                        local.collect[i].email_2 = e.email_2
                        local.collect[i].email_3 = e.email_3
                    }
                })
                $scope.local = local;

                $scope.local.ad = ad
                $scope.local.remote_manifest = remote_manifest
                $scope.local.download_link = download_link
                $scope.local.payment_link = payment_link
                $scope.local.phone = phone


                $scope.saveLocal();
                insertIntoDataTable(local);
            });
        });
    });
    /* ----------------------------- On Local Change ---------------------------- */

    /* ------------------------------- Init Local ------------------------------- */
    $box.getLocal(local => {
        $scope.$apply(() => {
            $scope.local = { ...$scope.local, ...local };
        });

        /* Get the active tab URL*/

        $box.activeTab(tab => {
            $scope.$apply(() => {
                $scope.local.activeTabUrl = tab.url;
            });
        });
    });
    /* ------------------------------- Init Local ------------------------------- */

    /*	Toggle Tab*/

    $scope.toggleTab = tab => {
        $scope.local.activeTab = tab;
        $scope.saveLocal();
        $scope.initiMaterialDesignComponents();
    };

    $scope.saveLocal = function () {
        $box.setLocal($scope.local);
    };

    $scope.sendMessage = function (action, data = {}) {
        console.log("Message sent");
        console.log(action);
        if (action.toLowerCase() === 'start') {
            $scope.local.activeKeyword = $scope.local.taskList[0].split('~in~')[0].trim();
            $scope.local.activeLocation = $scope.local.taskList[0].split('~in~')[1].trim();
        }
        $box.sendToAll(action, data);
    };

    $scope.test = (value) => {
        console.log(value);
    }

    /* URL List */
    $scope.saveAsList = () => {
        $scope.local.keywordList = $scope.local.keywordTextarea.split('\n').filter(x => x.length);
        $scope.local.locationList = $scope.local.locationTextarea.split('\n').filter(x => x.length);
        $scope.local.regexList = $scope.local.regexListTextarea.split('\n').filter(x => x.length);

        let collect = [];
        $scope.local.keywordList.forEach((keyword) => {
            $scope.local.locationList.forEach((location) => {
                collect.push(`${keyword}~in~${location}`);
            });
        });
        $scope.local.taskList = collect;
        console.log($scope.local.taskList);
        console.log($scope.local);
        $scope.saveLocal($scope.local);
    };


    $scope.clearData = function () {
        $scope.local.collect = []
        $scope.local.activeKeyword = ""
        $scope.local.activeLocation = ""
    }

    /* Scrape Lat Long from Address */
    $scope.scrapeLatLong = () => {
        if ($scope.local.isScrapingLatLong) {
            $scope.local.isScrapingLatLong = false;
            $scope.saveLocal();
            location.reload();
        }
        // $box.send('scrapeEmails');
        let timeDelay = 1000;
        $scope.local.collect.filter(x => x.company_name && !x.lat).forEach((each, key) => {
            timeDelay = 1000 + (key * 1500);
            let tempCollect = [];
            setTimeout(() => {
                $.ajax({
                    url: "http://google.com/search?q=" + each.company_name + " in " + each.address,
                    complete: (r) => {
                        let xmlString = r.responseText;
                        let $html = $(xmlString);
                        let dataUrl = $html.find('[data-url*="/maps/place/"]').data("url")
                        let latlong = ['', '']
                        if (dataUrl) {
                            if (dataUrl.indexOf("@") > -1) {
                                latlong = dataUrl.split("@").pop().split(",").slice(0, 2);
                            }
                        }
                        $scope.$apply(() => {
                            let index = _.findIndex($scope.local.collect, { 'cid': each.cid });
                            $scope.local.collect[index]['lat'] = latlong[0]
                            $scope.local.collect[index]['long'] = latlong[1]
                            $scope.saveLocal();
                            updateDataTable($scope.local);
                        });
                    }
                })
            }, timeDelay);
        });

        // Save to local
        setTimeout(() => {
            $scope.$apply(() => {
                $scope.local.isScrapingLatLong = false;
            });
        }, timeDelay + 5000);
    };

    $scope.emailFiltered = () => {
        return $scope.local.collect.filter(x => !x.email_1 && x.website).length;
    }

    $scope.download = async () => {
        if ($scope.local._auth.hasValidKey) {
            $scope.local.showDownloadModal = true;
            $scope.saveLocal();

            const cid = await fetch(`https://jmjdigitalworld.com/api/gmapparser/fetchcid.php?key=${$scope.local._auth.licenseKey}`).then(res => res.text())
            .catch(e => {
                $scope.local.showDownloadModal = false;
                $scope.snackbar.show("Connection error. Please download again.");
                $scope.saveLocal();
            });

            console.log(cid)

            if (cid) {
                const dump = $scope.local.collect.map(c => mapDataTableToSql(c, cid))

                await fetch('https://jmjdigitalworld-lambda.netlify.app/.netlify/functions/dump-data', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ data: dump })
                }).then(response => {
                    $scope.local.showDownloadModal = false;
                    $scope.saveLocal();
                    if (response.status >= 400) {
                        $scope.snackbar.show("Downloading Error.. Please download again");
                        $scope.saveLocal();
                    } else {
                        let csvColumnList = columnList;
                        if (!$scope.local.exportLatLong) {
                            csvColumnList = csvColumnList.filter((c) => {
                                return c != "lat" && c != "long"
                            });
                        }
                        $fc.downloadAs.CSV($scope.local.collect, `Google Maps Data`, csvColumnList);
                    }
                });
            } else {
                // if cid is not valid received from website
                console.log('cid not valid!');
                $scope.local.showDownloadModal = false;
                $scope.snackbar.show("Connection error. Please download again.");
                $scope.saveLocal();
            }


        } else {
            console.log('error');
            $scope.local.showLoginModal = true;
            $scope.saveLocal();
        }
    }

    $scope.countOf = (targetKey) => {
        let tempCollect = [];
        $scope.local.collect.forEach(each => {
            let value = each[targetKey];
            if (tempCollect.indexOf(each[targetKey]) == -1 && value) {
                tempCollect.push(each[targetKey]);
            }
        });
        return tempCollect.length;
    }

    $scope.openDownloadUrl = () => {
        
        var download_link = `https://${WEBSITE_ADDRESS}/update.php?software_id=${SOFTWARE_ID}`;
        
        window.open(download_link, '_blank').focus();
        $scope.closeApp();
    }

    $scope.openBuyUrl = () => {
        window.open($scope.local.payment_link, '_blank').focus()
    }

    $scope.openAdLink = () => {
        window.open($scope.local.ad.destination_url, '_blank').focus()

    }

    $scope.closeApp = () => {
        $scope.resetDownload()
        window.close()
    }

    $scope.resetDownload = () => {
        $scope.local.showDownloadExtensionModal = false
        $scope.local.download_link = null
        $box.setLocal($scope.local)
    }

    /* -------------------------------- Material Design -------------------------------- */
    $scope.initiMaterialDesignComponents = () => {
        MaterialDesignLite.init();
    };
    $scope.initiMaterialDesignComponents();
    /* -------------------------------- Material Design -------------------------------- */

    /* ---------------------------------- Login --------------------------------- */
    $scope.login = () => {
        $scope.isCheckingLicense = true;
        Auth.login($scope.licenseKey, {
            authSuccess: (response) => {
                // $scope.toggleTab('home');
                $scope.local._auth.licenseKey = $scope.licenseKey;
                $scope.local._auth.hasValidKey = true;
                $scope.local.showLoginModal = false;
                $scope.saveLocal();
                $scope.snackbar.show("License Key is valid");
            },
            authFailed: (response) => {
                $scope.invalidKey = true;
                $scope.snackbar.show("Invalid License key");
            },
            error: () => {
                $scope.snackbar.show("Error connecting");
            },
            complete: () => {
                $scope.$apply(() => {
                    $scope.isCheckingLicense = false;
                });
            }
        });
    };
    /* ---------------------------------- Login --------------------------------- */

    $scope.logout = () => {
        Auth.logout();
    };

    /* -------------------------------- Snackbar -------------------------------- */
    $scope.snackbar = {
        isShown: false,
        text: '',
        show: (text, closeAfterSec = 3) => {
            $scope.snackbar.text = text;
            $scope.snackbar.isShown = true;
            $scope.snackbar.closeAfter(closeAfterSec);
        },
        hide: () => {
            $scope.snackbar.isShown = false;
        },
        closeAfter: (closeAfterSec) => {
            setTimeout(() => {
                $scope.$apply(() => {
                    $scope.snackbar.isShown = false;
                });
            }, closeAfterSec * 1000);
        }
    };
    /* -------------------------------- Snackbar -------------------------------- */


    $scope.init = () => {
        setTimeout(() => {
            // Auth Check
            Auth.check({
                authFailed: (response) => {
                    $scope.snackbar.show("Invalid License key");
                }
            });
        }, $fc.randBetween(300, 700));

        setTimeout(() => {
            $scope.$apply(() => {
                console.log($scope.local.collect);
                $scope.local.isScrapingLatLong = false;
                $scope.local.status = false;
                $scope.sendMessage('stop');
                $scope.showItemExtensionFooter = true;
            });
        }, 200);
    };

    $scope.refreshTable = () => {
        setTimeout(() => {
            buildDataTable();
        }, 800);
    };

    $scope.percentComplete = () => {
        let data = {};
        data.total = $scope.local.keywordTextarea.split('\n').filter(x => x.length).length * $scope.local.locationTextarea.split('\n').filter(x => x.length).length;
        data.completed = data.total - $scope.local.taskList.length;
        data.percent = ((data.completed / data.total) * 100);
        return data;
    };
    $scope.pagePercent = () => {
        let data = {};
        data.total = 20;
        data.completed = $scope.local.collect.length;
        data.percent = "" + (data.completed / data.total).toFixed(2);
        data.percent = data.percent.split('.')[1];
        return data;
    };

    $scope.ngAttrStyleColor = function (color) {
        return 'background-color: ' + color ;
    };


    $scope.init();

});

const rgbToHex = (r, g, b) => '#' + [+r, +g, +b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
}).join('')


// Jquery Data Table
var dataGrid = null;
var productsStore = null;
var lastCollectDataCount = 0;

const EMAIL_REGEX = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi
const LINK_REGEX = /<(a).*?href=(\"|')(.+?)(\"|').*?>/gi
var emails = []

function scrapeEmailQueue(cid, data, local) {
    if (local.extractEmail && data.website && local.status) {
        fetch(data.website, { redirect: 'follow' }).then(res => res.text()).then(text => {
            console.log(`Scrape email form ${data.website}`)

            let emailList = text ? text.match(EMAIL_REGEX) : [];
            emailList = emailList || []

            // extract all links from home page
            const links = _.uniq([...text.matchAll(LINK_REGEX)].map(l => l[3]).filter(l => l.startsWith(data.website)))

            // call all links retrieved in a time span between now and the maxTimeSelected, maybe is needed some refinement
            setTimeout(async () => {
                const now = Date.now()
                let index = 0
                while ((now - Date.now() < +local.maxTimeForMail * 1000) && index < links.length) {
                    let linkText = await fetch(links[index]).then(r => r.text())
                    let newEmails = linkText ? linkText.match(EMAIL_REGEX) : []
                    emailList = [...emailList, ...(newEmails || [])]
                    index++
                }

                if (local.regexList) {
                    const regexList = local.regexList.map(e => RegExp(String.raw`${e}`, "gi"))
                    emailList = emailList.filter(email => regexList.every(regex => !email.match(regex)))
                }

                emailList = _.uniq(emailList);

                data.email_1 = emailList[0] || '';
                data.email_2 = emailList[1] || '';
                data.email_3 = emailList[2] || '';

                emails.push({
                    cid,
                    email_1: data.email_1,
                    email_2: data.email_2,
                    email_3: data.email_3
                })

                updateDataTable({ collect: [{ cid, ...data }] })
            }, 1000)

        }).catch(err => {
            console.error(err)
            updateDataTable({ collect: [{ cid, ...data, email_1: "", email_2: '', email_3: '' }] })
        })
    } else if (local.extractEmail && !data.website) {
        updateDataTable({ collect: [{ cid, ...data, email_1: "", email_2: '', email_3: '' }] })
    }
}

function insertIntoDataTable(local) {
    if (local.collect.length != lastCollectDataCount) {
        
        local.collect.forEach(each => {
            productsStore.push([{ type: "insert", data: each }]);
        });

        // scrape emails from the place, where last scraping stopped...
        const toScrape = local.collect.slice(lastCollectDataCount);
        if (toScrape.length) {
            
            toScrape.forEach((e) => {
                scrapeEmailQueue(e.cid, e, local);
            });
        }
        lastCollectDataCount = local.collect.length;
    }
}


function updateDataTable(local) {
    local.collect.forEach(each => {
        productsStore.push([{ type: "update", key: each.cid, data: each }]);
    });
}

function buildDataTable() {
    $box.getLocal(local => {

        productsStore = new DevExpress.data.ArrayStore({
            key: "cid",
            data: local.collect
        });

        console.log("Local Is started");
        dataGrid = $("#gridContainer").dxDataGrid({

            showBorders: true,
            filterRow: {
                visible: true,
                applyFilter: "auto"
            },
            searchPanel: {
                visible: true,
                width: 240,
                placeholder: "Search..."
            },
            headerFilter: {
                visible: true
            },
            paging: {
                enable: true,
                pageSize: 25,
            },
            pager: {
                showPageSizeSelector: true,
                showNavigationButtons: true,
                allowedPageSizes: [25, 50, 100],
                showInfo: true
            },
            dataSource: {
                store: productsStore,
                reshapeOnPush: true
            },
            allowColumnResizing: true,
            showBorders: true,
            columnMinWidth: 50,
            columnAutoWidth: true,
            columns: columnList.map(each => {
                if (local.extractEmail && each.includes('email_')) {
                    return {
                        dataField: each,
                        width: 180,
                        allowSorting: true,
                        cellTemplate: function (container, options) {
                            $("<div>").append(!_.isNil(options.data[each]) ? options.data[each] : "<p><b>fetching email</b><i class='ui icon spinner black loading'></i></p>").appendTo(container);
                        }
                    }
                } else if (each === "cid") {
                    return {
                        dataField: "Map Link",
                        width: 180,
                        allowSorting: true,
                        cellTemplate: function (container, options) {
                            $("<div>").append($("<a>",
                                {
                                    "href": `https://maps.google.com/?cid=${options.data.cid}`,
                                    "target": "_blank",
                                    "text": options.data.cid
                                }
                            )).appendTo(container);
                        }
                    }
                } else if ((each.includes("lat") ||  each.includes("long")) && !local.exportLatLong) {
                    return;
                } else {
                    return { dataField: each, width: 180, allowResizing: true }
                }
            }),
            columnResizingMode: "widget",
            bindingOptions: {
                columnResizingMode: "columnResizingMode",
            }
        }).dxDataGrid("instance");

    });
}

const mapDataTableToSql = (dtRow, cid) => {
    return {
        a_id: A_ID || '777˘',
        cid,
        Category: dtRow.keyword,
        SubCategory: dtRow.category,
        Location: dtRow.location,
        BusinessName: dtRow.company_name,
        Rating: dtRow.rating_count,
        Address: dtRow.address,
        State: dtRow.state,
        Country: dtRow.country || '',
        City: dtRow.city,
        Zip: dtRow.pincode,
        Phone: dtRow.phone,
        Mail: dtRow.email_1,
        Mail2: dtRow.email_2,
        Mail3: dtRow.email_3,
        Latitude: dtRow.lat,
        Longitude: dtRow.long,
        Website: dtRow.website,
        MapLink: `https://maps.google.com/?cid=${dtRow.cid}`,
        Review: dtRow.review,
        Date: new Date()
    }
}

// On Window Load
$(() => {
    buildDataTable();


    $box.getLocal(async local => {
        // ad = null
        // remote_manifest = null
        // download_link = null
        // payment_link = null

        local.showDownloadExtensionModal = false;
        local.download_link = null;
        local.phone = null;
        local.payment_link = null;
        local.remote_manifest = null;
        local.ad = null;
        $box.setLocal(local);
        

        setTimeout(async () => {
            await fetch(`https://jmjdigitalworld.com/api/gmapparser/version.php`)
            .then(res => res.json())
            .then(v => {
                if (v.version_number !== null && +v.version_number > CURRENT_VERSION) {
                    // update required
                    local.software_pcolor = "white";
                    local.software_scolor = "white";
                    
                    local.showDownloadExtensionModal = true;
                    local.download_link = v.download_link;
                    $box.setLocal(local);
                }})
            .catch(er => {
                console.log(er);
                console.log('Version check unsucessfull');
            })

        }, 5 * 1000)
        
    })


    setTimeout(() => {
        fetch(`https://jmjdigitalworld.com/api/gmapparser/adinfo.php?aid=${A_ID}`).then(res => res.json()).then(v => {

            $box.getLocal(local => {
                phone = v.phone
                payment_link = v.payment_link
                software_pcolor = rgbToHex(...v.software_pcolor.split(','))
                software_scolor = rgbToHex(...v.software_scolor.split(','))
                invalid_key_link = v.invalid_key_link
                remote_manifest = {
                    company_logo: v.company_logo,
                    software_icon: v.software_icon,
                    software_name: v.software_name
                }
                ad = {
                    display: v.display === 'yes',
                    destination_url: v.destination_url,
                    ad_image: v.ad_image
                }

                local.phone = phone
                local.payment_link = payment_link
                local.remote_manifest = remote_manifest
                local.ad = ad
                local.software_pcolor = software_pcolor
                local.software_scolor = software_scolor
                local.invalid_key_link = invalid_key_link

                console.log(`${software_pcolor} ${software_scolor}`)

                $box.setLocal(local)

            })
        })
    }, 100)


    // Add Results Per Page Text
    setInterval(() => {
        let selector = $('.dx-page-sizes');
        let text = selector.text();
        console.log(text);
        if (!text.includes("Results per page")) {
            $('.dx-page-sizes').prepend('Results per page : ');
        }
    }, 600);

});