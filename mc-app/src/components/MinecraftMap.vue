<template>
  <div class="map">
    <div class="map-viewport large-viewport">
      <div id="map-1">
        <MinecraftZoomLevel v-for="(zoomLevel, index) in zoomLevels" :zoom-level="zoomLevel" :index="index" :map-settings="mapSettings" />
      </div>
    </div>
  </div>
</template>

<script>
import size from 'viewport-size';
import { getViewportConfigTo } from '../lib/map-loader/map-render';
import MinecraftZoomLevel from './MinecraftZoomLevel';

export default {
  name: 'minecfrat-map',
  props: ['locations', 'mapSettings'],
  components: {
    MinecraftZoomLevel,
  },
  data() {
    return {
      zoomLevels: [],
    };
  },
  mounted() {
    this.zoomLevels = getViewportConfigTo({ width: size.getWidth(), height: size.getHeight() });
  },
};
</script>

<style scoped>
</style>
