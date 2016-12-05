<template>
  <div :id="`zoomlevel${index}`" class="current-level level" >
    <img src="../assets/img/ocean_map.png" style="display: none"/>
  </div>
</template>

<script>
import { mapRange, x, z } from '../lib/map-loader/default-settings';
import renderOcean from '../lib/map-loader/map-background';


export default {
  name: 'zoom-level-container',
  props: ['zoomLevel', 'index', 'mapSettings'],
  data() {
    return {
    };
  },
  mounted() {
    const canvas = this.$createElement('canvas');
    canvas.width = this.zoomLevel.width;
    canvas.height = this.zoomLevel.height;
    const translateCoordX = this.getTranslationFunction(this.mapSize(), x);
    const translateCoordZ = this.getTranslationFunction(this.mapSize(), z);
    console.warn('adeassss');
    console.warn(mapRange);
    console.warn(canvas);
    console.warn(translateCoordZ);
    console.warn(translateCoordX);

    const oceanMaskImage = this.$el.querySelector('img');
    const mapImage = this.$createElement('img', {
      attrs: {
        src: '../assets/img/map64.png',
      },
    });
    console.warn(mapImage);
    console.warn(renderOcean(this.mapSettings, mapImage, oceanMaskImage));
  },
  methods: {
    mapSize() {
      return this.width > this.height ? this.width : this.height;
    },
    getTranslationFunction(mapSize, mapPostion) {
      const halfMapSize = mapSize / 2;
      return (coord) => {
        const total = (((coord - mapPostion) * halfMapSize) / mapRange) + halfMapSize;
        return total;
      };
    },
  },
};
</script>

<style scoped>
</style>
