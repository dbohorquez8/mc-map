import stackblur from 'stackblur';

let x;
let z;
let hardCoastlines;
let mapRange;

const cOceanBlocksPerPixel = 16; // scale of the oceanMaskImage
const cWorkingCanvasOversample = 4;
// const cColorBlack = new RGB(0, 0, 0);
// const cColorWhite = new RGB(255, 255, 255);

function cloneCanvas(oldCanvasOrImage) {
  const newCanvas = document.createElement('canvas');
  newCanvas.width = oldCanvasOrImage.width;
  newCanvas.height = oldCanvasOrImage.height;
  const context = newCanvas.getContext('2d');
  context.drawImage(oldCanvasOrImage, 0, 0);
  return newCanvas;
}

function applyMapEdgesToCanvas(
  interiorCanvas,
  mapImage,
  edgeFadeStartTemp,
  edgeFadeDistanceTemp,
  edgeFadeAlphaTemp
) {
  let edgeFadeStart = edgeFadeStartTemp;
  let edgeFadeAlpha = edgeFadeAlphaTemp;
  let edgeFadeDistance = edgeFadeDistanceTemp;

  if (edgeFadeStartTemp === undefined) edgeFadeStart = 2;
  if (edgeFadeDistanceTemp === undefined) edgeFadeDistance = 4;
  if (edgeFadeAlphaTemp === undefined) edgeFadeAlpha = 0;

  const mapBordersCanvas = cloneCanvas(mapImage);
  const mapBordersContext = mapBordersCanvas.getContext('2d');
  const mapBordersData = mapBordersContext.getImageData(
    0,
    0,
    mapBordersCanvas.width,
    mapBordersCanvas.height);
  const mapBordersPixels = mapBordersData.data;

  const interiorContext = interiorCanvas.getContext('2d');
  const interiorData = interiorContext.getImageData(
    0,
    0,
    interiorCanvas.width,
    interiorCanvas.height);
  const interiorPixels = interiorData.data;

  const edgeFadeTable = new Array(mapBordersCanvas.width);
  let i = 0;
  for (i = 0; i < edgeFadeTable.length; i += 1) edgeFadeTable[i] = 255;
  for (i = 0; i < edgeFadeStart; i += 1) {
    edgeFadeTable[i] = edgeFadeAlpha;
    edgeFadeTable[edgeFadeTable.length - (i + 1)] = edgeFadeAlpha;
  }
  for (i = 0; i < edgeFadeDistance; i += 1) {
    let alpha = edgeFadeAlpha;
    alpha += Math.round(((255 - edgeFadeAlpha) * (i + 1)) / (edgeFadeDistance + 1));

    edgeFadeTable[i + edgeFadeStart] = alpha;
    edgeFadeTable[edgeFadeTable.length - (i + 1 + edgeFadeStart)] = alpha;
  }

  let tempX = 0;
  let tempZ = 0;
  let index = 0;
  let foundBorder = false;
  let borderR;
  let borderG;
  let borderB;

  for (tempZ = 0; tempZ < mapBordersCanvas.height; tempZ += 1) {
    const edgeFadeZ = edgeFadeTable[z]; // Like a lot of this code, assumes the map_Image is square

    for (tempX = 0; tempX < mapBordersCanvas.width; tempX += 1) {
      if (mapBordersPixels[index + 3] === 0) {
        // mapBordersPixels is transparent - i.e. beyond the tattered edge of the map
        // Don't show the interior either.
        interiorPixels[index + 3] = 0;
      } else if (foundBorder) {
        if (
          mapBordersPixels[index] === borderR &&
          mapBordersPixels[index + 1] === borderG &&
        mapBordersPixels[index + 2] === borderB
        ) {
          // Show only the border from map_Image
          interiorPixels[index + 3] = 0;
        } else {
          const edgeFadeX = edgeFadeTable[x];
          const edgeFade = edgeFadeX < edgeFadeZ ? edgeFadeX : edgeFadeZ;
          interiorPixels[index + 3] = edgeFade;
        }
      } else {
        foundBorder = true;
        borderR = mapBordersPixels[index];
        borderG = mapBordersPixels[index + 1];
        borderB = mapBordersPixels[index + 2];

        // Show only the border from map_Image
        interiorPixels[index + 3] = 0;
      }
      index += 4;
    }
  }
  interiorContext.putImageData(interiorData, 0, 0);

  mapBordersContext.drawImage(interiorCanvas, 0, 0);
  return mapBordersCanvas;
}
function imageToCanvas(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  console.warn('===');
  console.warn(image);
  canvas.getContext('2d').drawImage(image, 0, 0);
  return canvas;
}

function RGB(red, green, blue, alpha) {
  this.R = red;
  this.G = green;
  this.B = blue;
  this.A = (alpha === undefined) ? 255 : alpha;
}

function createWorkingCanvas(
  transformedOceanMaskCanvas,
  destWidth,
  destHeight
) {
  console.warn(transformedOceanMaskCanvas);
  console.warn(destWidth);
  const tWidth = transformedOceanMaskCanvas.width;
  const tHeight = transformedOceanMaskCanvas.height;

  if (tWidth % destWidth !== 0 ||
      tHeight % destHeight !== 0 ||
        tWidth / destWidth !== cWorkingCanvasOversample) {
    console.warn('createWorkingCanvas called with transformedOceanMask_Canvas size not a multiple of output size');
  }

  let result = document.createElement('canvas');

  if (hardCoastlines) {
    result.width = destWidth;
    result.height = destHeight;
    const context = result.getContext('2d');

    context.drawImage(
      transformedOceanMaskCanvas,
      0,
      0,
      transformedOceanMaskCanvas.width,
      transformedOceanMaskCanvas.height,
      0,
      0,
      destWidth,
      destHeight
    );
  } else {
    result = cloneCanvas(transformedOceanMaskCanvas);
  }
  return result;
}

RGB.prototype.blend = function blend(colorRgb, weight) {
  // clamp the weight to between 0 and 1
  let newWeight = 0.0;
  newWeight = (weight > 1) ? 1.0 : weight;
  const counterweight = 1.0 - weight;

  return new RGB(
    Math.round((colorRgb.R * newWeight) + (this.R * counterweight)),
    Math.round((colorRgb.G * newWeight) + (this.G * counterweight)),
    Math.round((colorRgb.B * newWeight) + (this.B * counterweight))
  );
};

// Returns true if the colour components match, regardless of alpha
RGB.prototype.matchesRGB = function matchesRGB(red, green, blue) {
  return red === this.R && green === this.G && blue === this.B;
};

// Returns true if the colour components match, regardless of alpha
RGB.prototype.matches = function matches(colorRgb) {
  return (colorRgb instanceof RGB)
  && colorRgb.R === this.R
  && colorRgb.G === this.G
  && colorRgb.B === this.B;
};

function renderThemeBlueCoastline(
  mapImage,
  transformedOceanMaskCanvas,
  destX,
  destZ,
  destWidth,
  destHeight
) {
  const cColorBlueCoast = new RGB(127, 160, 200);
  const cColorShallowCoast = new RGB(0, 40, 60);
  const cColorLightOcean = new RGB(160, 170, 200);
  const cColorLand = new RGB(208, 177, 120);
  const cAlphaOcean = Math.round(0.8 * 255);
  const cAlphaDeepOcean = Math.round(0.6 * 255);
  const cAlphaLand = Math.round(0.2 * 255);

  const workingImage = createWorkingCanvas(
    transformedOceanMaskCanvas,
    destWidth,
    destHeight
  );

  const workingImageContext = workingImage.getContext('2d');
  const workingWidth = workingImage.width;
  const workingHeight = workingImage.height;

  // our blurCanvas and not worry about losing its unblurred image.
  const blurCanvas = transformedOceanMaskCanvas;
  let blurRadius = Math.round((cWorkingCanvasOversample * mapImage.width) / 8);

  let blurScale = 3200.0 / mapRange;
  if (blurScale > 3) blurScale = 3; // Put a cap on it to stop stupid extremes
  blurRadius *= blurScale;
  stackblur(blurCanvas, 0, 0, blurCanvas.width, blurCanvas.height, blurRadius);


  const blurPixels = blurCanvas.getContext('2d').getImageData(0, 0, blurCanvas.width, blurCanvas.height).data;
  const workingImageData = workingImageContext.getImageData(0, 0, workingWidth, workingHeight);
  const workingPixels = workingImageData.data;

  const colorTableR = new Array(256);
  const colorTableG = new Array(256);
  const colorTableB = new Array(256);
  let i;
  for (i = 0; i < colorTableR.length; i += 1) {
    const shade = i / 255.0;
    let color = cColorBlueCoast.blend(cColorLightOcean, shade);

    let coastBlendStartShade = 0.5 / blurScale;
    if (coastBlendStartShade < 0.5) {
      coastBlendStartShade = 0.5;
    } else if (coastBlendStartShade > 0.7) {
      coastBlendStartShade = 0.7;
    }

    if (shade <= coastBlendStartShade) {
      color = color.blend(cColorShallowCoast, 0.5 - ((0.5 * shade) / coastBlendStartShade));
    }


    colorTableR[i] = color.R;
    colorTableG[i] = color.G;
    colorTableB[i] = color.B;
  }
  // avoid using classes, for speed.
  const colorLandR = cColorLand.R;
  const colorLandG = cColorLand.G;
  const colorLandB = cColorLand.B;

  const blurPixelXInc = (4 * blurCanvas.width) / workingWidth;
  const blurPixelYInc = (4 * blurCanvas.width) * ((blurCanvas.height / workingHeight) - 1);

  let tempX = 0;
  let tempZ = 0;
  let index = 0;
  let blurIndex = 0;

  for (tempZ = 0; tempX < workingHeight; tempZ += 1) {
    for (tempX = 0; tempX < workingWidth; tempX += 1) {
      const blurPixel = blurPixels[blurIndex];

      const isLand = workingPixels[index] > 128 && blurPixel > 75;

      let alpha;
      if (isLand) {
        // land
        alpha = cAlphaLand;

        workingPixels[index] = colorLandR;
        workingPixels[index + 1] = colorLandG;
        workingPixels[index + 2] = colorLandB;
      } else {
        const oceanDepth = (255 - blurPixel) / 255.0; // 0 to 1, 1 is deep, 0 is shallow
        alpha = Math.round((cAlphaOcean * (1 - oceanDepth)) + (cAlphaDeepOcean * oceanDepth));
        let tableIndex = Math.round((255 - blurPixel) * 0.7);
        if (tableIndex > 255) tableIndex = 255;
        if (tableIndex < 0) tableIndex = 0;

        workingPixels[index] = colorTableR[tableIndex];
        workingPixels[index + 1] = colorTableG[tableIndex];
        workingPixels[index + 2] = colorTableB[tableIndex];
      }
      workingPixels[index + 3] = alpha;

      index += 4;
      blurIndex += blurPixelXInc;
    }
    blurIndex += blurPixelYInc;
  }
  workingImageContext.putImageData(workingImageData, 0, 0);

  // Scale the processed ocean down to the same size as the mapImage, and
  // overlay it onto the paper texture of mapImage
  const mapBackgroundCopyCanvas = cloneCanvas(mapImage);
  const mapBackgroundCopyContext = mapBackgroundCopyCanvas.getContext('2d');

  mapBackgroundCopyContext.drawImage(
    workingImage,
    0,
    0,
    workingWidth,
    workingHeight,
    destX,
    destZ,
    destWidth,
    destHeight
  );

  return applyMapEdgesToCanvas(mapBackgroundCopyCanvas, mapImage, 1, 1);
}

export default function renderOcean(config, mapImage, oceanMaskImage) {
  mapRange = config.mapRange;
  x = config.x;
  z = config.z;
  hardCoastlines = config.hardCoastlines;

  // OceanMaskImage must be wider than 0 to avoid divide by zero
  if (oceanMaskImage.width === 0) {
    console.warn('Invalid ocean mask - width 0');
    return imageToCanvas(mapImage);
  }

  // inside the oceanMaskImage - (maskX, maskZ) with size (maskWidth, maskWidth)
  const maskCenterX = oceanMaskImage.width / 2;
  const maskCenterZ = oceanMaskImage.height / 2;
  const maskWidth = Math.round((mapRange * 2) / cOceanBlocksPerPixel);

  console.warn('=====');
  console.warn(x);
  console.warn(mapRange);
  console.warn(maskCenterZ);
  console.warn(cOceanBlocksPerPixel);
  console.warn('=====');
  const maskX = Math.round((maskCenterX + (x - mapRange)) / cOceanBlocksPerPixel);
  const maskZ = Math.round((maskCenterZ + (z - mapRange)) / cOceanBlocksPerPixel);

  console.warn('mask');
  console.warn(mapRange);

  console.warn('maskZ');
  console.warn(maskZ);
  // adjust the mask co-ords so they stay inside the bounds of the oceanMaskImage
  const adjMaskX = maskX < 0 ? 0 : maskX;
  const adjMaskZ = maskZ < 0 ? 0 : maskZ;


  let adjMaskWidth = maskWidth - (adjMaskX - maskX);
  let adjMaskHeight = maskWidth - (adjMaskZ - maskZ);
  adjMaskWidth = adjMaskWidth > oceanMaskImage.width ? oceanMaskImage.width : adjMaskWidth;
  adjMaskHeight = adjMaskHeight > oceanMaskImage.height ? oceanMaskImage.height : adjMaskHeight;

  const destScale = mapImage.width / maskWidth;
  const destX = Math.round((adjMaskX - maskX) * destScale);
  console.warn('adj');

  console.warn(adjMaskZ);
  const destZ = Math.round((adjMaskZ - maskZ) * destScale);
  const destWidth = Math.round(adjMaskWidth * destScale);
  const destHeight = Math.round(adjMaskHeight * destScale);
  const workingWidth = destWidth * cWorkingCanvasOversample;
  const workingHeight = destHeight * cWorkingCanvasOversample;

  const workingCanvas = document.createElement('canvas');
  workingCanvas.width = workingWidth;
  workingCanvas.height = workingHeight;
  const workingContext = workingCanvas.getContext('2d');
  workingContext.drawImage(
    oceanMaskImage,
    adjMaskX,
    adjMaskZ,
    adjMaskWidth,
    adjMaskHeight,
    0,
    0,
    workingWidth,
    workingHeight
  );


  // const theme = oceanTheme.toLowerCase();
  console.warn(destZ);
  return renderThemeBlueCoastline(
    mapImage,
    workingCanvas,
    destX,
    destZ,
    destWidth,
    destHeight
  );

  /*
     if (theme === 'darkseas') {
     return renderThemeDarkSeas(
     mapImage,
     workingCanvas,
     destX, destZ,
     destWidth,
     destHeight
     );
     } else if (theme === 'coastalrelief') {
     return renderThemeCoastalRelief(
     mapImage,
     workingCanvas,
     destX,
     destZ,
     destWidth,
     destHeight
     );
     } else {
     }
     */
}
