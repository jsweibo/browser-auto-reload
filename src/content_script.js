chrome.storage.local.get('config', function (res) {
  if ('config' in res) {
    if (res.config.until) {
      chrome.runtime.sendMessage({});
    }
  }
});
