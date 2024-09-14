
$box.on((event, data) => {
	console.log("Message received : " + event);

	if (event == 'stop') {
		console.log("Stopping");
		TaskManager.container.stop();
	}

});


/*-------------------------- On Load ------------------------*/
$(() => {
	console.log("Content.js loaded");
	$box.getLocal(local => {
		// TaskManager.startPendingTask(local);
		console.log(local);
		if (local.status) {
			console.log("Starting Process");
			
			// openEachStore();
			extractResults(); 
		}
	});
});

var startTime = new Date();

function extractResults(app_ini_state=true) {
	/**
	 * Called when GoogleMaps search page is loaded,
	 * Saves the results and scrolls further for more results to load
	 * and saves them recursively.
	 */
	$box.getLocal(local => {
		console.log('** Extracting Google Maps data...');
		var timeDelay = Math.floor(Math.random() * (3 - 1) ) + 3;
		saveResults((local) => {
			
			console.log('** saveResults callback called...');
			
			setTimeout(() => {
				// check if 'End of List' element is present on the page
				if (!endOfListExists()) {
					var timeDelay = Math.floor(Math.random() * (5 - 3) ) + 3;
					scrollPage(); // scroll the page
					setTimeout(() => {

						extractResults(false); // now only scrapes data from requests
					}, timeDelay * 1000);
				} else {
					console.log("** End of list reached, opening new search query...");
					
					local.taskList.shift();
					$box.setLocal(local, {
						onSet: () => {
							console.log("Sendig send message");
							$box.send('start');
						}
					});
			}

			}, timeDelay * 1000)
			
		}, app_ini_state)
	})
}

function saveResults(callback, app_ini_state) {
	/**
	 * Saves the GoogleMaps result to storage.
	 * First time takes scrapes using Window.APP_INITIALTION method.
	 * From next time on scrolls the page, and intercepts the requests.
	 */
	$box.getLocal(local => {
		var results;

		if (app_ini_state) {
			// first time, scrape using window.APP_INIITIALIZATION

			// extracting data from JSON
			results = voegToeAanCollection(document.getElementsByTagName('html')[0].innerHTML);

		} else {

			// try parsing results from newDataHolder, fall to callback if fails
			try {
				// from next on, scrape by checking 'newData' element on the page
				results = leesCollection(document.getElementById('newDataHolder').getAttribute('newdata'));
				startTime = new Date();
			} catch (e) {
				// mydata is not valid, call callback
				console.log('** newdata not valid, calling callback...');
				setTimeout(() => {
					callback(local);
				}, 1000);
				return;
			}

		}

		// saving to storage
		saveToLocal(callback, results);

	})
}

function saveToLocal(callback, results) {
	$box.getLocal(local => {

		for(let i=0; i<results.length; i++) {
			data = results[i];
	
			// Add data
			data.keyword = local.taskList[0].split("~in~")[0].trim()
			data.location = local.taskList[0].split("~in~")[1].trim()
	
			// // if guest user
			if(!local._auth.hasValidKey && local.collect.length >= 50) {
				console.log('** exceeded free quota...');
				local.showLoginModal = true;
				break;
			}
			local.collect.push(data);
			local.collect = _.uniqBy(local.collect, 'cid');
	
		}
	
		console.log("** Saving Data...");
		console.log(local.collect);
	
		
		$box.setLocal(local, {
			onSet: () => {
				console.log('** set successfully...');
	
				console.log("Calling callback");
				
				// if guest user
				if (!local._auth.hasValidKey && local.collect.length >= 50) {
					$box.send('stop');
				} else {
					console.log("Calling callback");
					// calling callback
					callback(local);
				}
			}
		});
	
	})
}

setTimeout(() => {
	/**
	 * Addes a requests intercepting script. Which will appen the data
	 * to 'newData' element on the page. Which will be used to add further data. 
	 */

	// adding a new element to DOM
	const dataHolder = document.createElement("div");
	dataHolder.setAttribute("id", "newDataHolder");
	document.body.appendChild(dataHolder);

	// observer for listening changes to added element
	const observer = new MutationObserver(function(mutations) {
		// pass
	});
	observer.observe(dataHolder, {
		//configure it to listen to attribute changes
		attributes: true
	});

	// script to intercept the requests, if correct response then 'append' to element
	const injectedScript ="(" +
		function() {
			// define monkey patch function
			const monkeyPatch = () => {
				let oldXHROpen = window.XMLHttpRequest.prototype.open;
				window.XMLHttpRequest.prototype.open = function() {
					this.addEventListener("load", function() {
						try {
							// try parsing the response, correct if works
							const responseBody = this.response.replace('/*""*/', '');
							parsedRespone = JSON.parse(responseBody);
							if(parsedRespone.d) {
								var data = parsedRespone.d.substr(4);

								document.getElementById('newDataHolder').setAttribute('newData', data);
							}
						} catch (e) {
							// not the required response
							// pass
						}
					});
					return oldXHROpen.apply(this, arguments);
				};
			};
			monkeyPatch();
		} + ")();";

	
	// script element for intercepting the requests
	const injectScript = () => {
		console.log("** Injecting Script");
		var script = document.createElement("script");
		script.textContent = injectedScript;
		(document.head || document.documentElement).appendChild(script);
		script.remove();
	};

	injectScript(); // injecting the script to dom
	console.log("** Requests interceptions started...");
}, 2* 1000)


// HELPER FUNCTIONS
function scrollPage() {
	/**
	 * Scrolls the results panel
	 */
	let currentTime = new Date();
	let minutesDifference = Math.abs(currentTime.getMinutes() - startTime.getMinutes());
	if (minutesDifference > 2){
		console.log(`** ${minutesDifference} minutes elapsed before getting new data, refreshing the page...`);
		$box.getLocal(local => {
				// local.taskList.shift();
				$box.setLocal(local, {
					onSet: () => {
						console.log("Sendig send message");
						$box.send('start');
					}
				});
			})
	}
	console.log('** Scrolling page...', minutesDifference);

	document.querySelectorAll(".m6QErb .DxyBCb .kA9KIf")[0].scrollTop = 1000000;
	return;
}

function endOfListExists() {
	/**
	 * Return Existence of 'End of List' div element on Page.
	 */

	if (document.querySelectorAll(".fontHeadlineLarge").length) {
		console.log('single page result...');
		return true;
	}
	return document.getElementsByClassName('HlvSq').length;
}

// setTimeout(() => {
// 	/**
// 	 * Automattically reloading page after 30 secs to avoid stuck loading issue.
// 	 */
// 	console.log('** Quiting scrapping session after 5 minutes...');

// 	$box.getLocal(local => {
// 		local.taskList.shift();
// 		$box.setLocal(local, {
// 			onSet: () => {
// 				console.log("Sendig send message");
// 				$box.send('start');
// 			}
// 		});
// 	})
	
// }, 300 * 1000)


// SCRAPING FUNCTIONS
function voegToeAanCollection(data) {
	try {
			collectedFlag = true;
			var filteredData = null;
			if (!data.includes("window.APP_INITIALIZATION_STATE")) {
					filteredData = JSON.parse(data.slice(0, -6))
							.d;
			} else {
					filteredData = JSON.parse(data.slice((data.indexOf("window.APP_INITIALIZATION_STATE=") + 32), data.indexOf(";window.APP_FLAGS")))[3][2];
			}

			if (filteredData === null) {
					return;
			}

			var ew = filteredData.substr(4);
			if (ew) {
					return leesCollection(ew);
			}
	} catch (error) {
			if (error.response) {
					console.log(error.response.data);
					console.log(error.response.status);
					console.log(error.response.headers);
			} else if (error.request) {
					console.log(error.request);
			} else {
					console.log('Error', error.message);
			}
			console.log(error);
	}

	return;
}

function leesCollection(values) {
	var data = JSON.parse(values)[0][1];
	var amount = data.length;

	var results = [];
	for (i = 0; i < amount; i++) {
			if (data[i].length == 15) {
				result = {}

					/*
					1. company_name - done
					2. website - done
					3. cid - done
					4. review - done
					5. rating_count - done
					6. address - done
					7. pincode - done
					8. subtitle
					9. category - done
					10. state - done
					11. city - done
				*/
				
				// company_name
				result.company_name = data[i][14][11];

				// website
				var url = '';
				if (data[i][14][7]) {
					url = data[i][14][7][0];
				}
				result.website = url;

				// cid and google maps url
				cid = hexToDec(data[i][14][10].split(':')[1]);
        gmu = 'https://www.google.com/maps?cid=' +  cid;

				result.cid = cid;

				// phone
				try {
					if (data[i][14][178][0][0]){
						var phone = data[i][14][178][0][3];
					}
				} catch(e) {
					var phone = '';
				}
				result.phone = phone;

				// review
				try {
					if (data[i][14][4][8]) {
						var total_review = data[i][14][4][8];
					}
				} catch(e) {
					var total_review = '';
				}
				result.rating_count = total_review;
				

				// ratings
				try {
					if (data[i][14][4][7]) {
						var rating = data[i][14][4][7];
					}
				} catch (e) {
					var rating = '';
				}
        result.review = rating;
	
				// address
				var address = ''
				if (data[i][14][39]) {
					address = data[i][14][39];
				}
				result.address = address;

				// pincode
				result.pincode = result.address.match(/\b[1000-999999]+\b/g);
				result.pincode = result.pincode ? result.pincode : [];
				result.pincode = result.pincode.length ? result.pincode.pop() : "";

				// category
				try {
					var category = data[i][14][13][0];
				} catch (e) {
					var category = '';
				}
				result.category = category;

				// city
				try {
					var last_add = data[i][14][2][data[i][14][2].length - 1];
				} catch (e) {
					var last_add = ''
				}

				try {
					var city = last_add.split(',')[0].trim();
				} catch (e) {
					var city = '';
				}
				result.city = city;

				// state
				try {
					var state = last_add.split(',')[1].replace(result.pincode, '').trim();
				} catch (e) {
					var state = '';
				}
				
				result.state = state;

				// latitude
				var lat = data[i][14][9][2];
				result.lat = lat;
	
				// longitude
				var long = data[i][14][9][3];
				result.long = long;

				results.push(result);
		}
	}
	return results;
}

function add(x, y, base) {
	var z = [];
	var n = Math.max(x.length, y.length);
	var carry = 0;
	var i = 0;
	while (i < n || carry) {
			var xi = i < x.length ? x[i] : 0;
			var yi = i < y.length ? y[i] : 0;
			var zi = carry + xi + yi;
			z.push(zi % base);
			carry = Math.floor(zi / base);
			i++;
	}
	return z;
}

function multiplyByNumber(num, x, base) {
	if (num < 0) return null;
	if (num == 0) return [];

	var result = [];
	var power = x;
	while (true) {
			if (num & 1) {
					result = add(result, power, base);
			}
			num = num >> 1;
			if (num === 0) break;
			power = add(power, power, base);
	}

	return result;
}

function parseToDigitsArray(str, base) {
	var digits = str.split('');
	var ary = [];
	for (var i = digits.length - 1; i >= 0; i--) {
			var n = parseInt(digits[i], base);
			if (isNaN(n)) return null;
			ary.push(n);
	}
	return ary;
}

function decToHex(decStr) {
	var hex = convertBase(decStr, 10, 16);
	return hex ? '0x' + hex : null;
}

function convertBase(str, fromBase, toBase) {
	var digits = parseToDigitsArray(str, fromBase);
	if (digits === null) return null;

	var outArray = [];
	var power = [1];
	for (var i = 0; i < digits.length; i++) {
			if (digits[i]) {
					outArray = add(outArray, multiplyByNumber(digits[i], power, toBase), toBase);
			}
			power = multiplyByNumber(fromBase, power, toBase);
	}

	var out = '';
	for (var i = outArray.length - 1; i >= 0; i--) {
			out += outArray[i].toString(toBase);
	}
	return out;
}

function hexToDec(hexStr) {
	if (hexStr.substring(0, 2) === '0x') hexStr = hexStr.substring(2);
	hexStr = hexStr.toLowerCase();
	return convertBase(hexStr, 16, 10);
}


/*-------------------------- On Load ------------------------*/


/*---------------------- Extension Toolbar ---------------------
$(function(){

	let extensionToolbar = {};
	extensionToolbar.height = "50px";
	extensionToolbar.url = chrome.extension.getURL("views/extensionToolbar.html");

	$('body').css('-webkit-transform','translateY('+extensionToolbar.height+')');
	$('html').append(`
	<iframe src="${extensionToolbar.url}" id="simple-chrome-extension-toolbar" style="height:${extensionToolbar.height};"></iframe>
	`);

});
---------------------- Extension Toolbar ---------------------*/
