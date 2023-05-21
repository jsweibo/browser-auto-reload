let config = null;
let activeTabs = [];

function start() {
  chrome.storage.local.get('config', function (res) {
    if ('config' in res) {
      // sync
      config = res.config;

      // remove old context menus
      chrome.contextMenus.removeAll(function () {
        initContextMenus();
      });
    } else {
      // writing settings will invoke chrome.storage.onChanged
      chrome.storage.local.set({
        config: DEFAULT_SETTINGS,
      });
    }
  });
}

function getStatus() {
  console.log({
    config: config,
    activeTabs: activeTabs,
  });
}

function initContextMenus() {
  chrome.contextMenus.create({
    title: 'Toggle',
    onclick(info, tab) {
      const tabId = tab.id;
      const index = activeTabs.findIndex(function (item) {
        return item.tabId === tabId;
      });
      if (index === -1) {
        startReloading(tabId);
      } else {
        stopReloading(tabId);
      }
    },
  });

  chrome.contextMenus.create({
    title: 'GetStatus',
    onclick() {
      getStatus();
    },
  });
}

function startReloading(tabId) {
  const index = activeTabs.findIndex(function (item) {
    return item.tabId === tabId;
  });
  if (index === -1) {
    chrome.tabs.reload(tabId, {
      bypassCache: config.bypass,
    });

    let timer = setInterval(function () {
      chrome.tabs.reload(tabId, {
        bypassCache: config.bypass,
      });
    }, config.period * 1e3);

    activeTabs.push({
      tabId: tabId,
      timer: timer,
    });
  }
}

function stopReloading(tabId) {
  const index = activeTabs.findIndex(function (item) {
    return item.tabId === tabId;
  });
  if (index !== -1) {
    clearInterval(activeTabs[index].timer);
    activeTabs.splice(index, 1);
  }
}

chrome.browserAction.onClicked.addListener(function () {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener(function (message, sender) {
  const tabId = sender.tab.id;
  const index = activeTabs.findIndex(function (item) {
    return item.tabId === tabId;
  });
  if (index !== -1) {
    stopReloading(tabId);
  }
});

chrome.tabs.onRemoved.addListener(function (tabId) {
  const index = activeTabs.findIndex(function (item) {
    return item.tabId === tabId;
  });
  if (index !== -1) {
    stopReloading(tabId);
  }
});

chrome.storage.onChanged.addListener(function () {
  // clear
  activeTabs.forEach(function (item) {
    stopReloading(item.tabId);
  });

  // restart
  start();
});

// start
start();
