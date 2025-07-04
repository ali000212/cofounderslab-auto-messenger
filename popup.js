document.getElementById('startBtn').addEventListener('click', () => {
  const message = document.getElementById('message').value;
  const interval = parseInt(document.getElementById('interval').value);

  chrome.storage.local.set({
    isRunning: true,
    message,
    interval,
    userIndex: 0,
    currentPage: 1
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.runtime.sendMessage({
      action: 'startScript',
      tabId: tabs[0].id
    });
  });
});

document.getElementById('stopBtn').addEventListener('click', () => {
  chrome.storage.local.set({ isRunning: false });
});
