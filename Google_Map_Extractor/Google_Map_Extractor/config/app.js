const DEVELOPER_INFO = {
	name: "jjjj jjjjjjjjjj",
	github: "https://jjjjjjjjj.com/jjjjjjj",
	upwork: "https://www.jjjjjjjjjj.com/fl/jjjjjjjj",
	linkedin: "https://www.jjjjjjjjj.com/in/jjjjjj-jjjjjjj/",
	website: "https://jjjjjjj.com/",
	facebook: "https://www.jjjjjjjjj.com/jjjjjj.jjjjjjjjjj.7",
	mail: "jjjjjjj@gmail.com"
};

const Config = {};

Config.itemId = 6;
Config.itemUrl =  `http://jjjjj.store/item/${Config.itemId}`;
Config.apiUrl = `${Config.itemUrl}/api`;

Config.itemAboutPage = Config.itemUrl+'/about';
Config.itemNotificationsPage = Config.itemUrl+'/notifications';
Config.itemFeedbackPage = Config.itemUrl+'/feedback';
Config.itemHelpPage = Config.itemUrl+'/help';
Config.itemContactPage = Config.itemUrl+'/contact';
Config.itemsSignupPage = Config.itemUrl+'/signup';
Config.itemExtensionFooter = Config.itemUrl+'/extension-footer?item_version='+$box.manifest.version;
Config.installUrl = `${Config.itemUrl}/install`;
Config.uninstallUrl = `${Config.itemUrl}/uninstall?item_id=${Config.itemId}&item_version=${$box.manifest.version}`;

var A_ID = '1029'
var CURRENT_VERSION = '7.0'

var SOFTWARE_ID = '705'
var WEBSITE_ADDRESS = 'digitalmbg.com'