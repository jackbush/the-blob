export const measureContainer = (containerId) => {
  const size = {};

  const el = document.getElementById(containerId);
  if (el) {
    size.width = el.clientWidth;
    size.height = el.clientHeight;
    return size;
  }
};

// This is used to give numbers a variance, defaulting to 10%
export const jitter = (number, factor) => {
  factor = factor || 0.1;
  const range = number * factor * Math.random() * 2;
  const variance = range - range / 2;
  return number + variance;
};

// Takes a hex code and channel ('r', 'g' or 'b') and returns 8bit int
export const getRgbFromHex = (hex, channel) => {
  let startIdx;
  if (channel === "r") {
    startIdx = 1;
  } else if (channel === "g") {
    startIdx = 3;
  } else if (channel === "b") {
    startIdx = 5;
  } else {
    throw new Error("Channel must be r, g or b");
  }

  const channelHex = hex.slice(startIdx, startIdx + 2);
  return parseInt(channelHex, 16);
};
