chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startScript') {
    chrome.scripting.executeScript({
      target: { tabId: request.tabId },
      files: ['content.js']
    });
  }
});

// Auto-inject after reload or navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('cofounderslab.com')) {
    chrome.storage.local.get("isRunning", ({ isRunning }) => {
      if (isRunning) {
        chrome.scripting.executeScript({
          target: { tabId },
          files: ['content.js']
        });
      }
    });
  }
});
