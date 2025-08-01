<template>
  <v-container>
    <v-card class="pa-6" elevation="6">
      <v-card-title class="headline font-weight-bold">
        Relatório de Clientes
      </v-card-title>

      <v-card-text>
        <v-row dense>
          <!-- Seleção de Clientes -->
          <v-col cols="12" sm="12" md="6">
            <v-autocomplete
              v-model="clientesSelecionados"
              :items="clientes"
              item-title="nome"
              item-value="id"
              label="Selecione os Clientes"
              multiple
              clearable
              outlined
              dense
              chips
            />
          </v-col>

          <!-- Seleção de Período -->
          <v-col cols="12" sm="12" md="6">
            <v-select
              v-model="periodoSelecionado"
              :items="periodos"
              item-title="label"
              item-value="value"
              label="Selecione o Período"
              outlined
              dense
              clearable
            />
          </v-col>
        </v-row>

        <v-btn
          color="primary"
          class="mt-4"
          :disabled="!clientesSelecionados.length || !periodoSelecionado"
          @click="gerarRelatorio"
        >
          Gerar Relatório
        </v-btn>

        <v-divider class="my-6"></v-divider>

        <v-simple-table v-if="relatorio.length">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Total Serviços (Kz)</th>
              <th>Total Produtos (Kz)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in relatorio" :key="item.clienteId">
              <td>{{ item.nome }}</td>
              <td>{{ formatarValor(item.totalServicos) }}</td>
              <td>{{ formatarValor(item.totalProdutos) }}</td>
            </tr>
          </tbody>
        </v-simple-table>

        <v-alert
          v-else-if="relatorioGerado"
          type="info"
          class="mt-4"
        >
          Nenhum resultado encontrado para os filtros aplicados.
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'

interface Cliente {
  id: number
  nome: string
}

interface ResultadoRelatorio {
  clienteId: number
  nome: string
  totalServicos: number | string
  totalProdutos: number | string
}

export default defineComponent({
  name: 'RelatorioClientes',
  setup() {
    const clientes = ref<Cliente[]>([])
    const clientesSelecionados = ref<number[]>([])
    const periodoSelecionado = ref<string | null>(null)
    const relatorio = ref<ResultadoRelatorio[]>([])
    const relatorioGerado = ref(false)

    const periodos = [
      { label: 'Hoje', value: 'hoje' },
      { label: 'Esta Semana', value: 'semana' },
      { label: 'Este Mês', value: 'mes' },
      { label: 'Este Trimestre', value: 'trimestre' },
      { label: 'Este Semestre', value: 'semestre' },
      { label: 'Este Ano', value: 'ano' }
    ]

    const carregarClientes = async () => {
      try {
        const { data } = await axios.get('/clientes')
        clientes.value = data
      } catch (err) {
        console.error(err)
        alert('Erro ao carregar clientes.')
      }
    }

    const gerarRelatorio = async () => {
      try {
        const { data } = await axios.post('/relatorio-clientes', {
          clientesIds: clientesSelecionados.value,
          periodo: periodoSelecionado.value
        })

        relatorio.value = data.resultados || []
        relatorioGerado.value = true
      } catch (err: any) {
        console.error(err)
        alert('Erro ao gerar relatório: ' + (err.response?.data?.erro || err.message))
      }
    }

    const formatarValor = (valor: number | string) => {
      const num = typeof valor === 'string' ? parseFloat(valor) : valor
      return num.toFixed(2)
    }

    carregarClientes()

    return {
      clientes,
      clientesSelecionados,
      periodoSelecionado,
      periodos,
      gerarRelatorio,
      relatorio,
      formatarValor,
      relatorioGerado
    }
  }
})
</script>
