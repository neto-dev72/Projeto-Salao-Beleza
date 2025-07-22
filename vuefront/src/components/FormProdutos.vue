<template>
  <v-container class="py-10">
    <v-card elevation="6" class="pa-6 mx-auto" max-width="600">
      <v-card-title class="text-h5">Cadastro de Produto</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="cadastrarProduto" ref="form">
          <v-text-field
            label="Nome do Produto"
            v-model="produto.nome"
            required
          />
          <v-textarea
            label="Descrição"
            v-model="produto.descricao"
          />
          <v-text-field
            label="Preço (kz)"
            v-model="produto.preco"
            type="number"
            step="0.01"
            required
          />
          <v-text-field
            label="Quantidade"
            v-model="produto.quantidade"
            type="number"
            required
          />
          <v-text-field
            label="Categoria"
            v-model="produto.categoria"
          />
          <v-checkbox
            v-model="produto.ativo"
            label="Produto ativo"
          />

          <v-btn type="submit" color="primary" class="mt-4">Cadastrar</v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar" :timeout="4000" color="green">
      Produto cadastrado com sucesso!
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'
axios.defaults.withCredentials = true

export default defineComponent({
  name: 'CadastroProduto',
  setup() {
    const produto = ref({
      nome: '',
      descricao: '',
      preco: '',
      quantidade: '',
      categoria: '',
      ativo: true
    })

    const form = ref<HTMLFormElement | null>(null)
    const snackbar = ref(false)

    const cadastrarProduto = async () => {
      try {
        const payload = {
          ...produto.value,
          preco: parseFloat(produto.value.preco),
          quantidade: parseInt(produto.value.quantidade)
        }

        await axios.post('/cadastrar-produtos', payload)
        snackbar.value = true
        form.value?.reset()
      } catch (error: any) {
        console.error('Erro ao cadastrar produto:', error)
        alert(error.response?.data?.erro || 'Erro ao cadastrar produto.')
      }
    }

    return { produto, cadastrarProduto, snackbar, form }
  }
})
</script>
