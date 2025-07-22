<template>
  <v-container class="pa-6 bg-grey-lighten-4">

    <!-- FILTROS -->
    <v-card class="pa-6 mb-8 elevation-2 rounded-xl">
      <v-card-title class="text-h6 font-weight-bold mb-4">
        <v-icon class="me-2" color="indigo-darken-2">mdi-tune</v-icon>
        Filtros
      </v-card-title>
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-select
            v-model="filtros.periodo"
            :items="periodos"
            label="Período"
            clearable
            variant="outlined"
            density="comfortable"
            color="indigo"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-select
            v-model="filtros.funcionarioId"
            :items="funcionarios"
            item-title="nome"
            item-value="id"
            label="Funcionário"
            clearable
            variant="outlined"
            density="comfortable"
            color="indigo"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-select
            v-model="filtros.servicoId"
            :items="servicos"
            item-title="nome"
            item-value="id"
            label="Serviço"
            clearable
            variant="outlined"
            density="comfortable"
            color="indigo"
          />
        </v-col>

        <v-col cols="12" sm="6" class="mt-4">
          <v-btn
            color="indigo-darken-2"
            class="text-white"
            block
            @click="carregarListagens"
            prepend-icon="mdi-magnify"
          >
            Buscar
          </v-btn>
        </v-col>

        <v-col cols="12" sm="6" class="mt-4">
          <v-btn
            color="grey-darken-1"
            class="text-white"
            block
            @click="limparFiltros"
            prepend-icon="mdi-broom"
          >
            Limpar Filtros
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- VENDAS -->
    <v-card class="pa-6 mb-8 elevation-2 rounded-xl bg-blue-grey-lighten-5">
      <v-card-title class="text-h6 font-weight-bold mb-4">
        <v-icon class="me-2" color="blue-grey-darken-2">mdi-cart-outline</v-icon>
        Vendas
      </v-card-title>
      <v-data-table
        :headers="headersVendas"
        :items="vendas"
        class="elevation-1 rounded-lg"
        density="comfortable"
        no-data-text="Nenhuma venda encontrada"
      >
        <template #item.servicos="{ item }">
          {{ Array.isArray(item.servicos) ? item.servicos.join(', ') : item.servicos }}
        </template>
      </v-data-table>
    </v-card>

    <!-- DESPESAS -->
    <v-card class="pa-6 mb-8 elevation-2 rounded-xl bg-red-lighten-5">
      <v-card-title class="text-h6 font-weight-bold mb-4">
        <v-icon class="me-2" color="red-darken-2">mdi-cash-remove</v-icon>
        Despesas
      </v-card-title>
      <v-data-table
        :headers="headersDespesas"
        :items="despesas"
        class="elevation-1 rounded-lg"
        density="comfortable"
        no-data-text="Nenhuma despesa encontrada"
      />
    </v-card>

  </v-container>
</template>

<script lang="ts" setup>

import { ref, onMounted } from 'vue'
import axios from 'axios'

// Referências dos dados
const vendas = ref([]) 
const despesas = ref([]) 

const funcionarios = ref([]) // Lista de funcionários
const servicos = ref([]) // Lista de serviços

const periodos = [
  { title: 'Hoje', value: 'hoje' },
  { title: 'Esta Semana', value: 'semana' },
  { title: 'Este Mês', value: 'mes' },
  { title: 'Este Trimestre', value: 'trimestre' },
  { title: 'Este Semestre', value: 'semestre' },
  { title: 'Este Ano', value: 'ano' }
]

const filtros = ref({
  periodo: '',
  funcionarioId: null, 
  servicoId: null 
})

// Cabeçalhos da tabela de Vendas
const headersVendas = [
  { title: 'Cliente', key: 'cliente' },
  { title: 'Funcionário', key: 'funcionario' },
  { title: 'Serviços', key: 'servicos' },
  { title: 'Valor Total', key: 'valor' },
  { title: 'Data', key: 'data' }
]

// Cabeçalhos da tabela de Despesas
const headersDespesas = [
  { title: 'Descrição', key: 'descricao' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Valor', key: 'valor' },
  { title: 'Data', key: 'data' }
]

// Função para carregar as listagens de vendas e despesas
const carregarListagens = async () => {
  try {
    const { data } = await axios.get('/painel-analitico/listagens', {
      params: filtros.value
    })
    vendas.value = data.vendas
    despesas.value = data.despesas
  } catch (err) {
    console.error('Erro ao buscar listagens:', err)
  }
}

// Função para limpar os filtros
const limparFiltros = () => {
  filtros.value = {
    periodo: '',
    funcionarioId: null,
    servicoId: null
  }
  carregarListagens()
}

// Função para carregar os funcionários e serviços da API
const carregarFuncionariosEServicos = async () => {
  try {
    const [funcionariosRes, servicosRes] = await Promise.all([
      axios.get('/funcionarios'),
      axios.get('/todos-servicos')
    ])
    funcionarios.value = funcionariosRes.data
    servicos.value = servicosRes.data
  } catch (err) {
    console.error('Erro ao carregar dados auxiliares:', err)
  }
}

// Carregar dados ao montar o componente
onMounted(() => {
  carregarFuncionariosEServicos()
  carregarListagens()
})
</script>

<style scoped>
/* Adiciona alguns estilos personalizados */
</style>
