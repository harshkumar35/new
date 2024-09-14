
chrome.browserAction.onClicked.addListener(function (activeTab) {
	console.log("Function called");
	$box.simplePopup(chrome.runtime.getURL('/views/index.html'), 'Title');
});

$box.on((event, data) => {

	console.log("Message received : " + event);

	if (event == "start") {
		console.log("Starting in background");
		$box.getLocal(local => {
			TaskManager.gotoTask(local, 'openMap');
		});
	}

	if (event == "stop") {
		console.log("stop event called");
		TaskManager.container.stop();
	}

	// if (event == "scrapeEmails") {
	// 	scrapeEmails();
	// }

});