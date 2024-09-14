const Auth = {

    login: (key, options) => {
        $box.getLocal(local => {
            $.ajax({
                type: "GET",
                url: 'https://jmjdigitalworld.com/api/gmapparser/gmapkeyregistration.php',
                data: {
                    key: key
                },
                success: (response) => {
                    response = response.trim();
                    if (response == "OK") {
                        options.authSuccess(response);
                    } else {
                        options.authFailed(response);
                        Auth.logout();
                    }
                },
                error: options.error,
                complete: options.complete,
            });
        });

    },

    logout: () => {
        $box.getLocal(local => {
            $.ajax({
                url: "https://jmjdigitalworld.com/api/gmapparser/deactivategmapkey.php",
                data: {
                    key: local._auth.licenseKey
                },
                complete: () => {
                    local._auth = $box.getDefaultLocalModel()._auth;
                    // local.activeTab = 'login';
                    local._auth.licenseKey = "";
                    local._auth.hasValidKey = false;
                    $box.setLocal(local);
                },
            });
        });
    },

    check: (options) => {
        $box.getLocal(local => {
            $.ajax({
                type: "GET",
                url: 'https://jmjdigitalworld.com/api/gmapparser/checkgmapkey.php',
                data: {
                    key: local._auth.licenseKey,
                },
                success: (response) => {
                    response = response.trim();
                    if (response == "OK") {
                        // options.authSuccess(response);
                    } else {
                        options.authFailed(response);
                        Auth.logout();
                    }
                },
                error: options.error,
                complete: options.complete,
            });
        });
    }
};

const $auth = Auth;