window.onload = async function () {
  const openThemeButton = document.getElementById("theme-open-button");
  const closeThemeButton = document.getElementById("theme-close-button");
  const colorInput = document.getElementById("theme-color-input");
  const link = document.getElementById("toggle-ext");

  const { userColor } = await chrome.storage.sync.get("userColor");
  const { activate } = await chrome.storage.sync.get("activate");
  const commands = await chrome.commands.getAll();
  const cmd = commands.find((cmd) => cmd.name === "toggle");
  let debounceTimeoutId;

  colorInput.defaultValue = userColor || "#000000";
  link.innerHTML = `Toggle extension ${cmd ? cmd.shortcut : ""}`;

  if (activate) {
    openThemeButton.style.backgroundColor = "var(--border-color)";
  } else {
    closeThemeButton.style.backgroundColor = "var(--border-color)";
  }

  const activateTheme = async () => {
    openThemeButton.style.backgroundColor = "var(--border-color)";
    closeThemeButton.style.backgroundColor = "var(--active-color)";
    await chrome.storage.sync.set({ activate: true });
  };

  const deactivateTheme = async () => {
    openThemeButton.style.backgroundColor = "var(--active-color)";
    closeThemeButton.style.backgroundColor = "var(--border-color)";
    await chrome.storage.sync.set({ activate: false });
  };

  openThemeButton.addEventListener("click", activateTheme);
  closeThemeButton.addEventListener("click", deactivateTheme);
  colorInput.addEventListener("input", async (e) => {
    clearTimeout(debounceTimeoutId);
    debounceTimeoutId = setTimeout(
      async () => await chrome.storage.sync.set({ userColor: e.target.value }),
      300
    );
  });
  link.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: `chrome://extensions/configureCommands#command-${chrome.runtime.id}-toggle`,
      active: true,
    });
  });
  chrome.storage.onChanged.addListener(async ({ activate }) => {
    if (!activate) return;

    if (activate.newValue) {
      await activateTheme();
    } else {
      await deactivateTheme();
    }
  });
};
