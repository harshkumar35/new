
const DEVELOPER_INFO = {
  name: "jjjjjjj jjjjjjjj",
  github: "https://jjjjjjjjjj.com/jjjjjjjj",
  upwork: "https://www.jjj.com/fl/jjj",
  linkedin: "https://www.jjj.com/in/jj-jj/",
  website: "https://jj.com/",
  facebook: "https://www.j.com/j.j.7",
  mail: "j@gmail.com"
};

const Config = {};

Config.itemId = 6;
Config.itemUrl =  `http://foxoyo.store/item/${Config.itemId}`;
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
