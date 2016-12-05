import { trim, is } from 'ramda';

const cMapRangeDefault = 3200;

function parseURL(url) {
  const a = document.createElement('a');
  a.href = url;
  return {
    source: url,
    protocol: a.protocol.replace(':', ''),
    host: a.hostname,
    port: a.port,
    query: a.search,
    params: (() => {
      const ret = {};
      const seg = a.search.replace(/^\?/, '').split('&');
      const len = seg.length;
      let i = 0;
      let s = null;

      for (;i < len; i += 1) {
        if (seg[i]) {
          s = seg[i].split('=');
          ret[s[0]] = s[1];
        }
      }
      return ret;
    })(),
    file: (a.pathname.match(/\/([^/?#]+)$/i) || [null, ''])[1],
    hash: a.hash.replace('#', ''),
    path: a.pathname.replace(/^([^/])/, '/$1'),
    relative: (a.href.match(/tps?:\/\/[^/]+(.+)/) || [null, ''])[1],
    segments: a.pathname.replace(/^\//, '').split('/'),
  };
}

function unquoteString(str) {
  let result = str;

  if (is(String, str) && str.length >= 2) {
    if (str[0] === '"' && str[str.length - 1] === '"') {
      const parsedStr = JSON.parse(`{"value":${str}}`);
      result = parsedStr.value;
    }
  }
  return result;
}

function stringToBool(value) {
  switch (trim(value).toLowerCase()) {
    case 'true':
    case 'on':
    case 'yes':
    case '1':
      return true;
    case 'false':
    case 'off':
    case 'no':
    case '0':
    case null:
      return false;
    default:
      return Boolean(value);
  }
}

export default function MapConfiguration() { }

// screenWidth and screenHeight are optional parameters - provide them if you have them
// and they will be used to pick a sensible default for HideLabelsAbove.
MapConfiguration.prototype.setDefaults = function setDefaults() {
  const hideLabelsAboveDefault = 0;
  /* commented out because I think smart-labels will work well at any screen size
     if (screenWidth > 0 || screenHeight > 0) {
  // small or tiny viewports will have hidelabelsabove set to 1 instead of 0, as
  // they don't have room for captions at the most zoomed out level.
  hideLabelsAboveDefault = (head.screen.height < 800 || head.screen.height < 800) ? 1 : 0;
  } */

  // MapDataUri has no default - it MUST represent the "src" param on the URL.
  if (!('HideLabelsAbove' in this)) this.HideLabelsAbove = hideLabelsAboveDefault;
  if (!('ShowLabelsBelow' in this)) this.ShowLabelsBelow = 3; // 0 is the most zoomed out map, 1 is the first level of zooming in, etc. The levels in between HideLabelsAbove & ShowLabelsBelow will use smart-labels.
  if (!('MapRange' in this)) this.MapRange = cMapRangeDefault;
  if (!('Title' in this)) this.Title = 'Map of the Overworld';
  if (!('Blurb' in this)) this.Blurb = 'Use up/down or mousewheel to zoom, drag to scroll';
  if (!('CustomIconsUri' in this)) this.CustomIconsUri = '';
  if (!('X' in this)) this.X = 0;
  if (!('Z' in this)) this.Z = 0;
  if (!('ShowOrigin' in this)) this.ShowOrigin = true;
  if (!('ShowScale' in this)) this.ShowScale = true;
  if (!('ShowCoordinates' in this)) this.ShowCoordinates = false;
  if (!('DisableCoordinates' in this)) this.DisableCoordinates = false;
  if (!('OceanTheme' in this)) this.OceanTheme = 'BlueCoastline';
  if (!('HardCoastlines' in this)) this.HardCoastlines = false;
  if (!('OceanMapUri' in this)) this.OceanMapUri = '';
};

MapConfiguration.prototype.assignFrom = function assignFrom(sourceConfig) {
  if ('MapDataUri' in sourceConfig) this.MapDataUri = sourceConfig.MapDataUri;
  if ('HideLabelsAbove' in sourceConfig) this.HideLabelsAbove = sourceConfig.HideLabelsAbove;
  if ('ShowLabelsBelow' in sourceConfig) this.ShowLabelsBelow = sourceConfig.ShowLabelsBelow;
  if ('MapRange' in sourceConfig) this.MapRange = sourceConfig.MapRange;
  if ('Title' in sourceConfig) this.Title = sourceConfig.Title;
  if ('Blurb' in sourceConfig) this.Blurb = sourceConfig.Blurb;
  if ('CustomIconsUri' in sourceConfig) this.CustomIconsUri = sourceConfig.CustomIconsUri;
  if ('X' in sourceConfig) this.X = sourceConfig.X;
  if ('Z' in sourceConfig) this.Z = sourceConfig.Z;
  if ('ShowOrigin' in sourceConfig) this.ShowOrigin = sourceConfig.ShowOrigin;
  if ('ShowScale' in sourceConfig) this.ShowScale = sourceConfig.ShowScale;
  if ('ShowCoordinates' in sourceConfig) this.ShowCoordinates = sourceConfig.ShowCoordinates;
  if ('DisableCoordinates' in sourceConfig) this.DisableCoordinates = sourceConfig.DisableCoordinates;
  if ('OceanTheme' in sourceConfig) this.OceanTheme = sourceConfig.OceanTheme;
  if ('HardCoastlines' in sourceConfig) this.HardCoastlines = sourceConfig.HardCoastlines;
  if ('OceanMapUri' in sourceConfig) this.OceanMapUri = sourceConfig.OceanMapUri;
};

MapConfiguration.prototype.assignFromRow = function assignFromRow(rowString) {
  const posEquals = rowString.indexOf('=');
  if (posEquals > 0) {
    const key = trim(rowString.substring(0, posEquals)).toLowerCase();
    const value = trim(rowString.slice(posEquals + 1));

    if (key === 'z') {
      const newZ = parseInt(value, 10);
      if (!isNaN(newZ)) this.Z = newZ;
    } else if (key === 'x') {
      const newX = parseInt(value, 10);
      if (!isNaN(newX)) this.X = newX;
    } else if (key === 'hidelabelsabove') {
      const newHideLabelsAbove = parseInt(value, 10);
      if (!isNaN(newHideLabelsAbove)) this.HideLabelsAbove = newHideLabelsAbove;
    } else if (key === 'showlabelsbelow') {
      const newShowLabelsBelow = parseInt(value, 10);
      if (!isNaN(newShowLabelsBelow)) this.ShowLabelsBelow = newShowLabelsBelow;
    } else if (key === 'range') {
      const newMapRange = parseInt(value, 10);
      if (!isNaN(newMapRange)) this.MapRange = newMapRange;
    } else if (key === 'title' && is(String, value)) {
      this.Title = unquoteString(value);
    } else if (key === 'blurb' && is(String, value)) {
      this.Blurb = unquoteString(value);
    } else if (key === 'icons' && is(String, value)) {
      this.CustomIconsUri = unquoteString(value);
    } else if (key === 'googleicons' && is(String, value)) {
      this.CustomIconsUri = `https://googledrive.com/host/${unquoteString(value)}`;
    } else if (key === 'showorigin' && is(String, value)) {
      this.ShowOrigin = stringToBool(value);
    } else if (key === 'showscale' && is(String, value)) {
      this.ShowScale = stringToBool(value);
    } else if (key === 'showcoordinates' && is(String, value)) {
      this.ShowCoordinates = stringToBool(value);
    } else if (key === 'disablecoordinates' && is(String, value)) {
      this.DisableCoordinates = stringToBool(value);
    } else if (key === 'oceantheme' && is(String, value)) {
      this.OceanTheme = unquoteString(value);
      this.HardCoastlines = this.OceanTheme.lastIndexOf('hard') === (this.OceanTheme.length - 4) && (this.OceanTheme.length > 3);
      if (this.HardCoastlines) {
        this.OceanTheme = this.OceanTheme.substr(0, this.OceanTheme.length - 4);
      }
    } else if (key === 'oceansrc' && is(String, value)) {
      this.OceanMapUri = unquoteString(value);
    } else if (key === 'oceangooglesrc' && is(String, value)) {
      this.OceanMapUri = `https://googledrive.com/host/${unquoteString(value)}`;
    }
  }
};

MapConfiguration.prototype.assignFromUrl = (urlString) => {
  const locationInfo = parseURL(urlString);

  if (Object.keys !== undefined && Object.keys(locationInfo.params).length === 0) {
    if (locationInfo.host.indexOf('googledrive.com') > 20) {
      this.Abort = true;
    }
  }

  if ('hidelabelsabove' in locationInfo.params) {
    this.HideLabelsAbove = locationInfo.params.hidelabelsabove;
  }

  if ('showlabelsbelow' in locationInfo.params) {
    this.ShowLabelsBelow = locationInfo.params.showlabelsbelow;
  }

  if ('range' in locationInfo.params) {
    this.MapRange = locationInfo.params.range;
  }

  if ('title' in locationInfo.params && is(String, locationInfo.params.title)) {
    this.Title = decodeURIComponent(locationInfo.params.title.replace(/\+/g, ' '));
  }

  if ('blurb' in locationInfo.params && is(String, locationInfo.params.blurb)) {
    this.Blurb = decodeURIComponent(locationInfo.params.blurb.replace(/\+/g, ' '));
  }

  if ('x' in locationInfo.params) {
    const newX = parseInt(locationInfo.params.x, 10);
    if (!isNaN(newX)) this.X = newX;
  }

  if ('z' in locationInfo.params) {
    const newZ = parseInt(locationInfo.params.z, 10);
    if (!isNaN(newZ)) this.Z = newZ;
  }

  if ('hideorigin' in locationInfo.params) this.ShowOrigin = false;
  if ('hidescale' in locationInfo.params) this.ShowScale = false;
  // or showoroigin and showscale could be specified explicitly
  if ('showorigin' in locationInfo.params && is(String, locationInfo.params.showorigin)) {
    this.ShowOrigin = stringToBool(locationInfo.params.showorigin);
  }
  if ('showscale' in locationInfo.params && is(String, locationInfo.params.showscale)) {
    this.ShowScale = stringToBool(locationInfo.params.showscale);
  }
  if ('showcoordinates' in locationInfo.params && is(String, locationInfo.params.showcoordinates)) {
    this.ShowCoordinates = stringToBool(locationInfo.params.showcoordinates);
  }

  // if "icons" is specified on the URL then set the CustomIconsUri to load the images.
  if ('icons' in locationInfo.params && is(String, locationInfo.params.icons)) {
    this.CustomIconsUri = locationInfo.params.icons;
  }
  if ('googleicons' in locationInfo.params && is(String, locationInfo.params.googleicons)) {
    this.CustomIconsUri = `https://googledrive.com/host/${locationInfo.params.googleicons}`;
  }

  if ('src' in locationInfo.params && is(String, locationInfo.params.src)) {
    this.MapDataUri = decodeURIComponent(locationInfo.params.src);
  }
  // Some extra support for hosting via Google Drive, as google drive is a good way to make
  // the map collaborative while avoiding cross-domain data headaches.
  if ('googlesrc' in locationInfo.params && is(String, locationInfo.params.googlesrc)) {
    if (locationInfo.params.googlesrc.toLowerCase().indexOf('http') === 0) {
      // User has used googlesrc when they should have used src. Rather than
      // explain the error just correct it.
      this.MapDataUri = locationInfo.params.googlesrc;
    } else {
      this.MapDataUri = `https://googledrive.com/host/${locationInfo.params.googlesrc}`;

      // People frequently create location files in Google Documents instead of .txt files,
      // until support for Google docs can be added, try to detect this mistake so the error
      // message can be meaningful. I don't know much about Google's id strings, but the doc
      // ones always seem to long and the file ones short, e.g:
      //
      // Example Google Doc id:        1nKzgtZKPzY8UKAGVtcktIAaU8cukUTjOg--ObQbMtPs
      // Example Google Drive file id: 0B35KCzsTLKY1YkVMeWRBemtKdHM
      // (28 chars vs 44)
      if (locationInfo.params.googlesrc.length > 40) this.GoogleSrcLooksLikeDoc = true;
    }
  }

  if ('oceansrc' in locationInfo.params && is(String, locationInfo.params.oceansrc)) {
    this.OceanMapUri = locationInfo.params.oceansrc;
  }
  if ('oceangooglesrc' in locationInfo.params && is(String, locationInfo.params.oceangooglesrc)) {
    if (locationInfo.params.oceangooglesrc.toLowerCase().indexOf('http') === 0) {
      // User has used googlesrc when they should have used src. Rather than
      // explain the error just correct it.
      this.OceanMapUri = locationInfo.params.oceangooglesrc;
    } else {
      this.OceanMapUri = `https://googledrive.com/host/${locationInfo.params.oceangooglesrc}`;
    }
  }

  if ('oceantheme' in locationInfo.params && is(String, locationInfo.params.oceantheme)) {
    this.OceanTheme = locationInfo.params.oceantheme;
    this.HardCoastlines = this.OceanTheme.lastIndexOf('hard') === (this.OceanTheme.length - 4) && (this.OceanTheme.length > 3);
    if (this.HardCoastlines) {
      this.OceanTheme = this.OceanTheme.substr(0, this.OceanTheme.length - 4);
    }
  }
};

// Returns a function that converts Minecraft coordinates into canvas coordinates
MapConfiguration.prototype.getXTranslationFunction = (mapSize) => {
  const halfMapSize = mapSize / 2;
  // the closure won't automatically keep a reference to 'this' so take a copy.
  const mapX = this.X;
  const mapRange = this.MapRange;

  return (coord) => {
    const total = (((coord - mapX) * halfMapSize) / mapRange) + halfMapSize;
    return total;
  };
};

// Returns a function that converts Minecraft coordinates into canvas coordinates
MapConfiguration.prototype.getZTranslationFunction = (mapSize) => {
  const halfMapSize = mapSize / 2;
  // the closure won't automatically keep a reference to 'this' so take a copy.
  const mapZ = this.Z;
  const mapRange = this.MapRange;

  return (coord) => {
    const total = (((coord - mapZ) * halfMapSize) / mapRange) + halfMapSize;
    return total;
  };
};
