chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.status === "completed") {
    chrome.scripting.executeScript({
      files: ["content_scripts.js"],
      target: { tabId },
    });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle") {
    const { activate } = await chrome.storage.sync.get("activate");
    await chrome.storage.sync.set({ activate: !activate });
  }
});
