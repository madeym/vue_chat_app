<script setup>
import { RouterLink, RouterView } from "vue-router";
import Alerts from './components/Alerts.vue';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "./assets/main.css";
import "./views/ChatPage/ChatPage.css"
import "./assets/css/responsive.css"
</script>

<template>
  <Alerts />
  <RouterView />
</template>

<style scoped>
* {
  padding: 0;
  margin: 0;
}
</style>
