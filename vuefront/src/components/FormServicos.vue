<template>
  <v-container class="py-10">
    <v-card elevation="6" class="pa-6 mx-auto" max-width="600">
      <v-card-title class="text-h5">Cadastro de Serviço</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="cadastrarServico" ref="form">
          <v-text-field
            label="Nome do Serviço"
            v-model="servico.nome"
            required
          />

          <v-textarea
            label="Descrição"
            v-model="servico.descricao"
          />

          <v-text-field
            label="Preço (kz)"
            v-model="servico.preco"
            type="number"
            step="0.01"
            required
          />

          <v-select
            label="Categoria"
            :items="categorias"
            item-title="nome"
            item-value="id"
            v-model="servico.CategoriaServicoId"
            required
            persistent-hint
            hint="Selecione a categoria do serviço"
            clearable
          />

          <!-- Novo campo: Switch para status -->
          <v-switch
            label="Ativo"
            v-model="servico.ativo"
            color="green"
            class="mt-4"
            inset
          />

          <v-btn type="submit" color="primary" class="mt-4">Cadastrar</v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar" :timeout="4000" color="green">
      Serviço cadastrado com sucesso!
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from 'axios'
axios.defaults.withCredentials = true

export default defineComponent({
  name: 'CadastroServico',
  setup() {
    const servico = ref({
      nome: '',
      descricao: '',
      preco: '',
      CategoriaServicoId: null as number | null,
      ativo: true  // ✅ valor padrão ativo
    })

    const categorias = ref<{ id: number; nome: string }[]>([])
    const form = ref<HTMLFormElement | null>(null)
    const snackbar = ref(false)

    const carregarCategorias = async () => {
      try {
        const { data } = await axios.get('/categorias-servicos')
        categorias.value = data
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
        alert('Erro ao carregar categorias')
      }
    }

    const cadastrarServico = async () => {
      if (!servico.value.CategoriaServicoId) {
        alert('Por favor, selecione uma categoria.')
        return
      }

      try {
        const payload = {
          nome: servico.value.nome,
          descricao: servico.value.descricao,
          preco: parseFloat(servico.value.preco),
          CategoriaServicoId: servico.value.CategoriaServicoId,
          ativo: servico.value.ativo  // ✅ incluído no payload
        }

        await axios.post('/cadastrar-servicos', payload)

        snackbar.value = true
        form.value?.reset()
        servico.value = {
          nome: '',
          descricao: '',
          preco: '',
          CategoriaServicoId: null,
          ativo: true
        }
      } catch (error: any) {
        console.error('Erro ao cadastrar serviço:', error)
        alert(error.response?.data?.erro || 'Erro ao cadastrar serviço.')
      }
    }

    onMounted(carregarCategorias)

    return {
      servico,
      categorias,
      cadastrarServico,
      snackbar,
      form
    }
  }
})
</script>
