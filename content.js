function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getCurrentPageNumber() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('page')) || 1;
}

function goToNextPage() {
  const currentPage = getCurrentPageNumber();
  const nextPage = currentPage + 1;

  const url = new URL(window.location.href);
  url.searchParams.set('page', nextPage);

  chrome.storage.local.set({ userIndex: 0, currentPage: nextPage }, () => {
    window.location.href = url.toString();
  });
}

// Wait for DOM elements like buttons to be ready
async function waitForConnectButtons(timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const buttons = Array.from(document.querySelectorAll('button')).filter(
      btn => btn.innerText.trim().toLowerCase() === 'connect'
    );
    if (buttons.length > 0) return buttons;
    await wait(500);
  }
  return [];
}

async function clickConnectAndSend(message, interval) {
  const buttons = await waitForConnectButtons();
  if (buttons.length === 0) {
    console.log("No connect buttons found. Skipping page.");
    goToNextPage();
    return;
  }

  let { userIndex = 0 } = await chrome.storage.local.get("userIndex");

  for (let i = userIndex; i < buttons.length; i++) {
    const { isRunning } = await chrome.storage.local.get("isRunning");
    if (!isRunning) {
      await chrome.storage.local.set({ userIndex: i });
      return;
    }

    buttons[i].click();
    await wait(1000);

    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = message;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const sendBtn = Array.from(document.querySelectorAll('button')).find(btn =>
      btn.innerText.trim().toLowerCase() === 'send'
    );
    if (sendBtn) sendBtn.click();

    await wait(interval);
  }

  // Finished all users on this page
  await chrome.storage.local.set({ userIndex: 0 });
  goToNextPage();
}

chrome.storage.local.get(["isRunning", "message", "interval"], ({ isRunning, message, interval }) => {
  if (isRunning) {
    setTimeout(() => {
      clickConnectAndSend(message, interval || 1000);
    }, 2000);
  }
});
