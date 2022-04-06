let config = null;
let activeTabs = [];

// contextMenus Id
let toggleId = -1;

function reset() {
  activeTabs.forEach(function (item) {
    stopReloading(item.tabId);
  });
  activeTabs = [];
  config = null;
  updateContextMenus();
  chrome.storage.local.clear();
}

function getStatus() {
  console.log({
    config: config,
    activeTabs: activeTabs,
  });
}

function updateContextMenus() {
  chrome.contextMenus.update(toggleId, {
    enabled: !!config,
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

chrome.storage.onChanged.addListener(function (changes) {
  if (changes.config) {
    activeTabs.forEach(function (item) {
      stopReloading(item.tabId);
    });

    // sync
    if ('newValue' in changes.config) {
      config = changes.config.newValue;
    }
  }

  updateContextMenus();
});

chrome.tabs.onRemoved.addListener(function (tabId) {
  const index = activeTabs.findIndex(function (item) {
    return item.tabId === tabId;
  });
  if (index !== -1) {
    stopReloading(tabId);
  }
});

// start
chrome.storage.local.get('config', function (res) {
  if ('config' in res) {
    config = res.config;
  }

  toggleId = chrome.contextMenus.create({
    title: 'Toggle',
    enabled: false,
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

  updateContextMenus();
});
