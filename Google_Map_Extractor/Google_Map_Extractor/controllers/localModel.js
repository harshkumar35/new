$box.getDefaultLocalModel = () => {
  let data = {

    _box: {
      localLogs: ""
    },

    _auth: {
      hasValidKey: false,
      licenseKey: ""
    },

    _stats: {
      appOpenCount: 0,
      tabsOpenCount: {},
    },

    _notifications: {
      last_show_notification_hash: "",
      list: []
    },

    _taskManager: {
      isWorking: false,
      activeTask: false
    },

    _googleForm: {
      actionUrl: "",
      inputs: []
    },

    activeTabUrl: "",
    activeTab: "home",

    status: false,

    swipeDirection: "right",
    delayLower: 10,
    delayUpper: 15,
    delayTime: 10,

    collect: [],
    keywordList: [],
    locationList: [],
    taskList: [],
    regexList: [],

    isScrapingEmail: false,

    keywordTextarea: "",
    locationTextarea: "",
    activeQuery: "",
    activeKeyword: "",
    activeLocation: "",
    regexListTextarea: "",

    showLoginModal: false,
    maxTimeForMail: 10,
    showDownloadModal: false,
    software_pcolor: "white",
    software_scolor: "white"
  };
  return data;
};