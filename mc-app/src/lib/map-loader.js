import firebase from 'firebase';
import axios from 'axios';
import { trim, is } from 'ramda';
import fbLocation from './fb-location';
import SuppressableLabel from './map-loader/suppressable-lable';

export default {
  perform() {
    const config = {
      apiKey: 'AIzaSyAnLku8oPnICEUJwOhp8f7iV9FSNvhKiNI',
      authDomain: 'mc-map-e1d7d.firebaseapp.com',
      databaseURL: 'https://mc-map-e1d7d.firebaseio.com',
      storageBucket: 'mc-map-e1d7d.appspot.com',
      messagingSenderId: '451362324845',
    };

    firebase.initializeApp(config);
    fbLocation.init(firebase.database());
  },

/*
  oldCallBack(configFromAjax, locationsFromAjax) {
    const screenHeight = size.height;
    const screenWidth = size.width;
    const mapConfig = new MapConfiguration();
    mapConfig.setDefaults(screenWidth, screenHeight);
    mapConfig.assignFrom(configFromAjax);
    // mapConfig.assignFrom(configFromUrl);

    // ApplyMapConfiguration(mapConfig);

    /*
    const deferreds = [];
    const loadCustomIconsDeferredObj = $.Deferred();
    deferreds[0] = loadCustomIconsDeferredObj;


    if (!isEmpty(mapConfig.customIconsUri)) {
      $(gCustomIcons).bind({
        load(){
          gCustomIconsLoaded = true;
          loadCustomIconsDeferredObj.resolve();
        },
        error() {
          // Image didn't load, probably a 404
          loadCustomIconsDeferredObj.resolve();
        }
      });
      gCustomIcons.src = mapConfig.customIconsUri;

    } else {
      loadCustomIconsDeferredObj.resolve();
    }

    if (loadingOceanMap_deferredObj == null) {
      loadingOceanMap_deferredObj = loadOceanMap_Async(mapConfig, true);
    }
    if (loadingOceanMap_deferredObj != null) {
      deferreds[1] = loadingOceanMap_deferredObj;
    }

    $.when.apply($,deferreds).done(
      () => { callback(mapConfig, locationsFromAjax); }
    );
  },
*/

  oldImplementation(callback) {
    return axios.get('/static/data.txt').then((response) => {
      const data = response.data;
      this.parseTextLocations(data, callback);
    });
  },

  parseTextLocations(data, callback) {
    const config = new (() => 0)();
    const locationList = [];

    const lines = data.split('\n');
    let i = 0;
    for (i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (line[0] !== '/' || trim(line).length === 0) {
        const newLocation = this.createLocationFromRow(i + 1, lines[i]);
        if (newLocation instanceof this.Location) {
          locationList.push(newLocation);
        } else {
          this.assignFromRow(lines[i]);
        }
      }
    }
    callback(config, locationList);
  },

  createLocationFromRow(entryNumber, commaSeperatedValues) {
    let result = null;
    let values = null;
    values = commaSeperatedValues.split(',');

    let typeName = values[0];

    // Wikis can treat camelcase words like "PlayerStructure" as wikiwords and
    // put a questionmark after them so remove any trailing questionmark.
    if (typeName[typeName.length - 1] === '?') typeName = typeName.substring(0, typeName.length - 1);

    if (typeName in this.locationType) {
      const newType = this.locationType[typeName];
      const newX = parseInt(values[1], 10);
      const newZ = parseInt(values[2], 10);
      const newIconIndex = parseInt(values[6], 10);

      if (!isNaN(newX) && !isNaN(newZ)) {
        // type and co-ords check out, can return a real location.
        result = new this.Location(
          newX,
          newZ,
          newType,
          this.unquoteString(values[3]),
          this.unquoteString(values[4]),
          this.unquoteString(values[5]),
          newIconIndex
        );
      }
    }
    return result;
  },

  Location(x, z, type, description, owner, href, iconIndex) {
    this.x = x;
    this.z = z;
    this.type = type;
    this.labelOverride = SuppressableLabel.parse(description);
    this.hrefOverride = href;
    this.iconIndexOverride = iconIndex;
    this.owner = SuppressableLabel.parse(owner);
  },

  assignFromRow(rowString) {
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
        this.Title = this.unquoteString(value);
      } else if (key === 'blurb' && is(String, value)) {
        this.Blurb = this.unquoteString(value);
      } else if (key === 'icons' && is(String, value)) {
        this.CustomIconsUri = this.unquoteString(value);
      } else if (key === 'googleicons' && is(String, value)) {
        this.CustomIconsUri = `https://googledrive.com/host/${this.unquoteString(value)}`;
      } else if (key === 'showorigin' && is(String, value)) {
        this.ShowOrigin = this.stringToBool(value);
      } else if (key === 'showscale' && is(String, value)) {
        this.ShowScale = this.stringToBool(value);
      } else if (key === 'showcoordinates' && is(String, value)) {
        this.ShowCoordinates = this.stringToBool(value);
      } else if (key === 'disablecoordinates' && is(String, value)) {
        this.DisableCoordinates = this.stringToBool(value);
      } else if (key === 'oceantheme' && is(String, value)) {
        this.OceanTheme = this.unquoteString(value);
        this.HardCoastlines = this.OceanTheme.lastIndexOf('hard') === (this.OceanTheme.length - 4) && (this.OceanTheme.length > 3);
        if (this.HardCoastlines) {
          this.OceanTheme = this
          .OceanTheme
          .substr(0, this.OceanTheme.length - 4);
        }
      } else if (key === 'oceansrc' && is(String, value)) {
        this.OceanMapUri = this.unquoteString(value);
      } else if (key === 'oceangooglesrc' && is(String, value)) {
        this.OceanMapUri = `https://googledrive.com/host/${this.unquoteString(value)}`;
      }
    }
  },

  locationType: {
    Village: { iconIndex: 0, name: 'Plains Village', href: 'http://minecraft.gamepedia.com/Village#Plains' },
    DesertVillage: { iconIndex: 1, name: 'Desert village', href: 'http://minecraft.gamepedia.com/Village#Desert' },
    SavannahVillage: { iconIndex: 0, name: 'Savannah village', href: 'http://minecraft.gamepedia.com/Village#Savannah' },
    WitchHut: { iconIndex: 3, name: 'Witch\'s hut', href: 'http://minecraft.gamepedia.com/Generated_structures#Witch_Huts' },
    JungleTemple: { iconIndex: 4, name: 'Jungle temple', href: 'http://minecraft.gamepedia.com/Jungle_temple' },
    DesertTemple: { iconIndex: 5, name: 'Desert temple', href: 'http://minecraft.gamepedia.com/Desert_temple' },
    NetherFortress: { iconIndex: 6, name: 'Nether Fortress', href: 'http://minecraft.gamepedia.com/Nether_Fortress' },
    NetherPortal: { iconIndex: 7, name: 'Portal', href: 'http://minecraft.gamepedia.com/Nether_Portal' },

    Forest: { iconIndex: 28, name: 'Forest', href: 'http://minecraft.gamepedia.com/Biome#Forest' },
    FlowerForest: { iconIndex: 26, name: 'Flower forest', href: 'http://minecraft.gamepedia.com/Flower_forest' },
    MushroomIsland: { iconIndex: 29, name: 'Mushroom island', href: 'http://minecraft.gamepedia.com/Mushroom_Island' },
    Horse: { iconIndex: 34, name: '', href: 'http://minecraft.gamepedia.com/Horse' },
    Wolf: { iconIndex: 35, name: '', href: 'http://minecraft.gamepedia.com/Wolf' },
    Dragon: { iconIndex: 36, name: '', href: '' }, // No default href as dragon symbol could be used for many things, stronghold, 'Here be dragons' etc
    SeaMonster: { iconIndex: 46, name: '', href: '' },
    Ship: { iconIndex: 38, name: '', href: '' }, // No default href as ship is probably used for map decoration
    IcePlainsSpikes: { iconIndex: 47, name: 'Ice plains spikes', href: 'http://minecraft.gamepedia.com/Ice_Plains_Spikes' },
    Spawn: { iconIndex: 40, name: 'Spawn', href: '' },
    PlayerStructure: { iconIndex: 8, name: '', href: '' },
    PlayerCastle: { iconIndex: 9, name: '', href: '' },
    PlayerHouse: { iconIndex: 10, name: '', href: '' },
    PlayerFarm: { iconIndex: 14, name: 'Farm', href: '' },
    PlayerMachine: { iconIndex: 12, name: '', href: '' },
    EnchantingRoom: { iconIndex: 44, name: '', href: 'http://minecraft.gamepedia.com/Enchantment_Table' },
    Label: { iconIndex: -1, name: '', href: '' },

    FenceOverlay: { iconIndex: 13, name: '', href: '' },
    IslandOverlay: { iconIndex: 30, name: '', href: '' },
  },

  unquoteString(str) {
    let result = str;

    if (is(String, str) && str.length >= 2) {
      if (str[0] === '"' && str[str.length - 1] === '"') {
        const parsedStr = JSON.parse(`{"value":${str}}`);
        result = parsedStr.value;
      }
    }
    return result;
  },


  stringToBool(value) {
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
  },
};
