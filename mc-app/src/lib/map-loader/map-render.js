import config from './default-settings';

export function getViewportConfigTo(screenSize) {
  if (screenSize.height < 640 || screenSize.width < 640) {
    return config.sizeScreenAndZoom.small;
  } else if (screenSize.height < 800 || screenSize.width < 800) {
    return config.sizeScreenAndZoom.medium;
  }

  return config.sizeScreenAndZoom.large;
}

export function renderMap(screenSize) {
  console.warn(screenSize);
}
