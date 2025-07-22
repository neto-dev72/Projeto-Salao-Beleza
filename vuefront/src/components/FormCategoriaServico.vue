<template>
  <v-container class="py-10">
    <v-card elevation="6" class="pa-6 mx-auto" max-width="600">
      <v-card-title class="text-h5">Cadastro de Categoria de Serviço</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="cadastrarCategoria" ref="form">
          <v-text-field
            label="Nome da Categoria"
            v-model="categoria.nome"
            required
          />
          <v-textarea
            label="Descrição"
            v-model="categoria.descricao"
          />

          <v-btn type="submit" color="primary" class="mt-4">Cadastrar</v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar" :timeout="4000" color="green">
      Categoria cadastrada com sucesso!
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'
axios.defaults.withCredentials = true

export default defineComponent({
  name: 'CadastroCategoriaServico',
  setup() {
    const categoria = ref({
      nome: '',
      descricao: ''
    })

    const form = ref<HTMLFormElement | null>(null)
    const snackbar = ref(false)

    const cadastrarCategoria = async () => {
      try {
        await axios.post('/cadastrar-categoria-servico', categoria.value)
        snackbar.value = true
        form.value?.reset()
      } catch (error: any) {
        console.error('Erro ao cadastrar categoria:', error)
        alert(error.response?.data?.erro || 'Erro ao cadastrar categoria.')
      }
    }

    return { categoria, cadastrarCategoria, snackbar, form }
  }
})
</script>
