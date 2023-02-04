const THEME_BACKGROUND_COLOR = "theme-background-color";
const THEME_TEXT_COLOR = "theme-text-color";
const styleSheetId = "theme-switcher-style";

const init = async function () {
  document.addEventListener("DOMContentLoaded", () => addClassNames());

  chrome.storage.onChanged.addListener(async ({ userColor }) => {
    if (userColor) await insertStyleSheet(true);
  });
  chrome.storage.onChanged.addListener(async ({ activate }) => {
    if (!activate) return;

    if (activate.newValue) {
      await insertStyleSheet();
    } else {
      removeStyleSheet();
    }
  });

  const { activate } = await chrome.storage.sync.get("activate");
  if (activate) {
    await insertStyleSheet();
  }
};
init();

async function insertStyleSheet(checkIfActivated = false) {
  if (checkIfActivated) {
    const { activate } = await chrome.storage.sync.get("activate");
    if (!activate) return;
  }

  removeStyleSheet();
  const css = await generateStyleSheet();

  const link = document.createElement("style");
  link.innerHTML = css;
  link.id = styleSheetId;
  document.head.append(link);
}

function removeStyleSheet() {
  const styleSheet = document.getElementById(styleSheetId);
  if (styleSheet) styleSheet.remove();
}

async function generateStyleSheet() {
  let { userColor } = await chrome.storage.sync.get("userColor");
  userColor = userColor || "#000000";

  let textColor;
  // check contrast then send bg color and text color
  if (isEnoughContrast(hexToRgb(userColor), [0, 0, 0])) {
    textColor = "black";
  } else {
    textColor = "white";
  }

  return `
    .${THEME_BACKGROUND_COLOR} {
        background-color: ${userColor} !important;
    }
    .${THEME_TEXT_COLOR} {
        color: ${textColor} !important;
    }
  `;
}

function addClassNames() {
  document.querySelectorAll("*").forEach((el) => {
    // check if it is transparent bg
    const currentBgColor = window
      .getComputedStyle(el)
      .getPropertyValue("background-color");
    if (
      currentBgColor !== "transparent" &&
      currentBgColor !== "rgba(0, 0, 0, 0)"
    ) {
      el.classList.add(THEME_BACKGROUND_COLOR);
    }

    el.classList.add(THEME_TEXT_COLOR);
  });
}

function luminance(r, g, b) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(rgb1, rgb2) {
  const lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

function isEnoughContrast(rgb1, rgb2) {
  return contrast(rgb1, rgb2) >= 4.5;
}
