<template>
  <v-container class="py-6">
    <v-card elevation="6" class="pa-6 mx-auto" max-width="600">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5">Editar Serviço</span>
        <v-btn icon @click="$emit('fechar')" aria-label="Fechar">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="atualizarServico" ref="form">
          <v-text-field
            label="Nome do Serviço"
            v-model="localServico.nome"
            required
          />
          <v-textarea
            label="Descrição"
            v-model="localServico.descricao"
          />
          <v-text-field
            label="Preço (Kz)"
            v-model.number="localServico.preco"
            type="number"
            step="0.01"
            required
          />

          <v-select
            label="Categoria"
            :items="categorias"
            item-title="nome"
            item-value="id"
            v-model="localServico.CategoriaServicoId"
            required
            hint="Selecione a categoria do serviço"
            persistent-hint
            clearable
          />

          <v-switch
            label="Ativo"
            v-model="localServico.ativo"
            class="my-4"
          />

          <v-btn type="submit" color="primary">Salvar</v-btn>
        </v-form>
      </v-card-text>

      <v-snackbar
        v-model="snackbar.show"
        :timeout="4000"
        :color="snackbar.color"
        location="top right"
      >
        {{ snackbar.text }}
      </v-snackbar>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue'
import axios from 'axios'

axios.defaults.withCredentials = true

export default defineComponent({
  name: 'EditarServico',
  props: {
    servico: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const localServico = ref({ ...props.servico })
    const snackbar = ref({ show: false, text: '', color: 'success' })
    const categorias = ref<{ id: number; nome: string }[]>([])
    const form = ref<HTMLFormElement | null>(null)

    // Recarrega dados do serviço quando prop for atualizada
    watch(() => props.servico, (novo) => {
      localServico.value = { ...novo }
    })

    // Carrega categorias do salão do usuário
    const carregarCategorias = async () => {
      try {
        const { data } = await axios.get('/categorias-servicos')
        categorias.value = data
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
        alert('Erro ao carregar categorias.')
      }
    }

    // Atualiza serviço via API
    const atualizarServico = async () => {
      if (!localServico.value.id) {
        alert('ID do serviço não encontrado.')
        return
      }

      if (!localServico.value.CategoriaServicoId) {
        alert('Por favor, selecione uma categoria.')
        return
      }

      try {
        const payload = {
          nome: localServico.value.nome,
          descricao: localServico.value.descricao,
          preco: parseFloat(String(localServico.value.preco)),
          ativo: localServico.value.ativo,
          CategoriaServicoId: localServico.value.CategoriaServicoId
        }

        await axios.patch(`/salvar-servicos/${localServico.value.id}`, payload)

        snackbar.value = {
          show: true,
          text: 'Serviço atualizado com sucesso!',
          color: 'success'
        }

        emit('salvo')
      } catch (error: any) {
        console.error('Erro ao atualizar serviço:', error)
        snackbar.value = {
          show: true,
          text: error.response?.data?.erro || 'Erro ao atualizar serviço.',
          color: 'error'
        }
      }
    }

    onMounted(carregarCategorias)

    return {
      localServico,
      categorias,
      atualizarServico,
      snackbar,
      form
    }
  }
})
</script>

<style scoped>
/* Nenhum estilo custom necessário */
</style>
