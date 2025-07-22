<template>
  <v-app>
    <Navbar />   <!-- Sempre renderiza -->

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Navbar from './components/Navbar.vue';

export default defineComponent({
  components: { Navbar },
});
</script>
