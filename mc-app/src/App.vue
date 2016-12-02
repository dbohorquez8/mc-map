<template>
  <div id="app">
    <center>
      <h1 id="mainTitle">Map of the Overworld</h1>
      <p id="tagline">Use up/down or mousewheel to zoom, drag to scroll</p>
    </center>

    <div style="position: absolute; left: 50%;">
      <div id="loading" style="position:relative; top: 50px; left: -50%; text-align: center; z-index: 40">
        <img src="./assets/img/clock_10ms.gif" width="64" height="64" style="image-rendering:-moz-crisp-edges; image-rendering: -o-crisp-edges; image-rendering:-webkit-optimize-contrast; -ms-interpolation-mode:nearest-neighbor;" /><br/>
        <i><b>Mining locations...</b></i>
      </div>

      <div id="sunsetsign" class="sunsign hidden-sunsign" style="top: 352px; width: 192px; right: 410px">
        <img src="./assets/img/sunsetsign.png" width="192" height="96" />
      </div>
      <div id="sunrisesign" class="sunsign hidden-sunsign" style="top: 352px; width: 192px; left: 410px">
        <img src="./assets/img/sunrisesign.png" width="192" height="96"/>
      </div>
    </div>

    <div style="position: absolute; left: 50%;">
      <div id="hoverFrame" class="hidden-hoverFrame" style="position:relative; top: -20px; left: -50%; text-align: center; z-index: 30; pointer-events:none;">
        <div id="locationDesc"></div>
      </div>
    </div>

    <main>
      <div class="map-viewport large-viewport">
        <div id="map-1">
          <div id="zoomlevel1" class="current-level level" ></div>
          <div id="zoomlevel2" class="level" ></div>
          <div id="zoomlevel3" class="level" ></div>
          <div id="zoomlevel4" class="level" ></div>
        </div>
      </div>
    </main>

    <div id="signsunderneith" class="hidden-sunsign" width="100%">
      <img src="./assets/img/sunsetsign_arrow.png" width="192" height="96" align="left"/>
      <img src="./assets/img/sunrisesign_arrow.png" width="192" height="96" align="right"/>
    </div>

    <div class="printicon" style="position:absolute; bottom: 2px; left: 3px;">
      <!-- If you don't want this print icon to be shown on the map page, find the line:
        $('#poster-print-href').show();
        in the javascript code in this page, and comment it out -->
        <a id="poster-print-href" style="display: none;" href="poster_print.html" alt="Generate printable poster image">&#9113;</a>
    </div>

    <div class="credittext" style="position:absolute; bottom: 5px; right: 5px;">
      <!-- Take advantage of this tiny text to include the fonts in the document 
        so that $(document).ready() isn't triggered before they are loaded. -->
        <a href="http://buildwithblocks.info">create your own Ink &amp; Parchment Map</a>	
    </div>

    <div class="resources" style="position: absolute; visibility: hidden;">
      <img id="map-background" src="./assets/img/map64.png"/>
      <img id="map-tileset" src="./assets/img/glyphs.png"/>
    </div>
  </div>
</template>

<script>
import Hello from './components/Hello';
import mapLoader from './lib/map-loader';

export default {
  name: 'app',
  components: {
    Hello,
  },
  created() {
    mapLoader.oldImplementation();
  },
};
</script>

<style>
#locationDesc {
  width: 250px;
  padding: 4px 0px 6px 0px;
  border-color: transparent;
  border-style: solid;
  border-width: 22px 25px 22px 20px;

  border-image-width: 22 25 22 20;
  border-image:        url("./assets/img/scrollborder.png") 22 25 22 20 fill stretch;
  -moz-border-image:   url("./assets/img/scrollborder.png") 22 25 22 20 fill stretch; /* Old firefox */
  -webkit-border-image:url("./assets/img/scrollborder.png") 22 25 22 20 fill stretch; /* Safari */
  -o-border-image:     url("./assets/img/scrollborder.png") 22 25 22 20 fill stretch; /* Opera */
}
</style>
