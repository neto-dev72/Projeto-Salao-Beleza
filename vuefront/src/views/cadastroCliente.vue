<template>
  <v-container class="py-10">
    <FormCliente />
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FormCliente from '@/components/FormCliente.vue'

export default defineComponent({
  components: { FormCliente }
})
</script>
