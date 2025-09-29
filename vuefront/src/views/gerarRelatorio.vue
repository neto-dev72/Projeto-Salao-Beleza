<template>
  <v-container class="py-12">
    <v-card
      class="pa-10 mx-auto"
      max-width="1000"
      elevation="8"
      rounded="2xl"
      style="background: linear-gradient(to bottom right, #F3F8FE, #D8E3F8)"
    >
      <!-- CABEÇALHO -->
      <div class="text-center mb-10">
        <v-icon size="48" color="blue-grey" class="mb-3">mdi-chart-bar</v-icon>
        <h2 class="text-h4 font-weight-bold mb-2">Relatório de Serviços e Produtos</h2>
        <p class="text-body-1 text-blue-grey">
          Visualize o desempenho financeiro de serviços e produtos em um período escolhido.
        </p>
      </div>

      <!-- FILTROS -->
      <v-row dense class="mb-8">
        <v-col cols="12">
          <h3 class="text-subtitle-1 font-weight-bold mb-1">Filtros do Relatório</h3>
          <p class="text-body-2 text-blue-grey">
            Escolha o período, selecione serviços/produtos ou gere um relatório geral.
          </p>
        </v-col>

        <!-- Seleção de Período -->
        <v-col cols="12" md="4">
          <v-select
            v-model="periodoSelecionado"
            :items="periodos"
            label="Período"
            prepend-icon="mdi-calendar-range"
            variant="outlined"
            density="comfortable"
            color="light-blue"
          />
        </v-col>

        <!-- Seleção de Serviços -->
        <v-col cols="12" md="4">
          <v-select
            v-model="servicoIds"
            :items="servicos"
            item-title="nome"
            item-value="id"
            label="Serviços"
            multiple
            clearable
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-scissors-cutting"
            color="light-blue"
            :disabled="relatorioGeral"
          >
            <template #append>
              <v-tooltip text="Selecionar todos os serviços">
                <template #activator="{ props }">
                  <v-btn icon v-bind="props" @click="selecionarTodosServicos" color="light-blue">
                    <v-icon>mdi-select-all</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </template>
          </v-select>
        </v-col>

        <!-- Seleção de Produtos -->
        <v-col cols="12" md="4">
          <v-select
            v-model="produtoIds"
            :items="produtos"
            item-title="nome"
            item-value="id"
            label="Produtos"
            multiple
            clearable
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-cube"
            color="purple-lighten-4"
            :disabled="relatorioGeral"
          >
            <template #append>
              <v-tooltip text="Selecionar todos os produtos">
                <template #activator="{ props }">
                  <v-btn icon v-bind="props" @click="selecionarTodosProdutos" color="purple-lighten-4">
                    <v-icon>mdi-select-all</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </template>
          </v-select>
        </v-col>

        <!-- Opções Extras -->
        <v-col cols="12" class="d-flex flex-wrap align-center">
          <v-checkbox
            v-model="incluirDespesas"
            label="Incluir despesas"
            density="comfortable"
            prepend-icon="mdi-cash-refund"
            color="blue"
            class="mr-6"
          />
          <v-checkbox
            v-model="relatorioGeral"
            label="Relatório Geral (ignorar filtros)"
            density="comfortable"
            prepend-icon="mdi-chart-areaspline"
            color="green"
          />
        </v-col>

        <v-col cols="12">
          <v-btn
            block
            size="large"
            color="light-blue"
            class="text-white mt-4"
            @click="gerarRelatorio"
            :disabled="!relatorioGeral && servicoIds.length === 0 && produtoIds.length === 0"
            rounded="xl"
            elevation="2"
          >
            <v-icon left>mdi-file-chart</v-icon>
            Gerar Relatório
          </v-btn>
        </v-col>
      </v-row>

      <!-- RESULTADO -->
      <div v-if="resultado && Object.keys(resultado).length">
        <v-divider class="mb-8"></v-divider>

        <div class="text-right mb-4">
          <v-btn color="purple-lighten-4" @click="exportarPDF" class="text-white" rounded="xl">
            <v-icon left>mdi-file-pdf-box</v-icon> PDF
          </v-btn>
        </div>

        <div ref="relatorioRef" class="pa-4 bg-white rounded-xl">
          <!-- Resumo do Período -->
          <v-sheet color="blue-grey-lighten-5" class="pa-6 mb-6" rounded="xl" elevation="1">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">
              <v-icon left class="mr-2">mdi-calendar</v-icon>
              Resumo do Período
            </h3>
            <p class="text-body-2 mt-2">
              <strong>De:</strong> {{ formatarData(resultado.dataInicio) }} <br>
              <strong>Até:</strong> {{ formatarData(resultado.dataFim) }}
            </p>
          </v-sheet>

          <!-- Serviços -->
          <v-sheet v-if="resultado.detalhesServicos?.length" class="pa-6 mb-6" color="indigo-lighten-5" rounded="xl" elevation="1">
            <h3 class="text-subtitle-1 font-weight-bold mb-4">Serviços</h3>
            <v-table density="compact">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Quantidade</th>
                  <th>Total (Kz)</th>
                  <th>Média (Kz)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in resultado.detalhesServicos" :key="s.id">
                  <td>{{ s.nome }}</td>
                  <td>{{ s.quantidade }}</td>
                  <td>{{ formatarKz(s.total) }}</td>
                  <td>{{ formatarKz(s.media) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-sheet>

          <!-- Produtos -->
          <v-sheet v-if="resultado.detalhesProdutos?.length" class="pa-6 mb-6" color="deep-purple-lighten-5" rounded="xl" elevation="1">
            <h3 class="text-subtitle-1 font-weight-bold mb-4">Produtos</h3>
            <v-table density="compact">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Quantidade</th>
                  <th>Total (Kz)</th>
                  <th>Média (Kz)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in resultado.detalhesProdutos" :key="p.id">
                  <td>{{ p.nome }}</td>
                  <td>{{ p.quantidade }}</td>
                  <td>{{ formatarKz(p.total) }}</td>
                  <td>{{ formatarKz(p.media) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-sheet>

          <!-- Totais e Saldo -->
          <v-row class="mt-8">
            <v-col cols="12" md="6">
              <v-alert type="success" variant="tonal" rounded="xl" border="start" border-color="green">
                <v-icon class="mr-2">mdi-cash-multiple</v-icon>
                <strong>Total vendido:</strong> {{ formatarKz(resultado.totalVendido) }}<br />
                <strong>Total serviços (Kz):</strong> {{ formatarKz(resultado.totalServicosVendidos) }}<br />
                <strong>Total produtos (Kz):</strong> {{ formatarKz(resultado.totalProdutosVendidos) }}
              </v-alert>
            </v-col>
            <v-col cols="12" md="6" v-if="incluirDespesas">
              <v-alert type="info" variant="tonal" rounded="xl" border="start" border-color="blue">
                <v-icon class="mr-2">mdi-cash-refund</v-icon>
                <strong>Total despesas:</strong> {{ formatarKz(resultado.totalDespesas) }}<br />
                <strong>Saldo:</strong> {{ formatarKz(resultado.saldo) }}
              </v-alert>
            </v-col>
          </v-row>
        </div>
      </div>

      <v-alert
        v-else-if="resultado !== null"
        type="warning"
        class="mt-10"
        border="start"
        colored-border
        variant="tonal"
        icon="mdi-alert-circle-outline"
      >
        Nenhum dado encontrado para os filtros selecionados.
      </v-alert>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const periodoSelecionado = ref('Hoje')
const periodos = ['Hoje', 'Semana', 'Mês', 'Trimestre', 'Semestre', 'Ano']

const servicoIds = ref<number[]>([])
const produtoIds = ref<number[]>([])
const incluirDespesas = ref(true)
const relatorioGeral = ref(false)

const servicos = ref<any[]>([])
const produtos = ref<any[]>([])
const resultado = ref<null | any>(null)
const totalGeral = ref(0)

onMounted(async () => {
  servicos.value = (await axios.get('/todos-servicos')).data
  produtos.value = (await axios.get('/todos-produtos')).data
})

const selecionarTodosServicos = () => {
  servicoIds.value = servicos.value.map(s => s.id)
}
const selecionarTodosProdutos = () => {
  produtoIds.value = produtos.value.map(p => p.id)
}

function calcularPeriodo() {
  const agora = dayjs()
  let inicio
  const fim = agora.endOf('day')

  switch (periodoSelecionado.value) {
    case 'Hoje':
      inicio = agora.startOf('day')
      break
    case 'Semana':
      inicio = agora.subtract(6, 'day').startOf('day') // últimos 7 dias
      break
    case 'Mês':
      inicio = agora.subtract(1, 'month').startOf('day') // últimos 30 dias
      break
    case 'Trimestre':
      inicio = agora.subtract(3, 'month').startOf('day') // últimos 3 meses
      break
    case 'Semestre':
      inicio = agora.subtract(6, 'month').startOf('day') // últimos 6 meses
      break
    case 'Ano':
      inicio = agora.startOf('year')
      break
    default:
      inicio = agora.startOf('month')
  }

  return {
    startDate: inicio.format('YYYY-MM-DD'),
    endDate: fim.format('YYYY-MM-DD')
  }
}

const gerarRelatorio = async () => {
  const { startDate, endDate } = calcularPeriodo()
  try {
    const params: any = {
      startDate,
      endDate,
      incluirDespesas: incluirDespesas.value
    }
    if (relatorioGeral.value) {
      params.geral = true
    } else {
      params.servicoIds = servicoIds.value
      params.produtoIds = produtoIds.value
    }

    const res = await axios.get('/relatorio-servico', {
      params,
      paramsSerializer: p => {
        const q = new URLSearchParams()
        q.append('startDate', p.startDate)
        q.append('endDate', p.endDate)
        q.append('incluirDespesas', p.incluirDespesas.toString())
        if (p.geral) q.append('geral', 'true')
        p.servicoIds?.forEach((id: number) => q.append('servicoIds', id.toString()))
        p.produtoIds?.forEach((id: number) => q.append('produtoIds', id.toString()))
        return q.toString()
      }
    })
    resultado.value =
      (!res.data.detalhesServicos?.length &&
       !res.data.detalhesProdutos?.length &&
       res.data.totalVendido === 0)
        ? {} : res.data
    totalGeral.value = res.data.totalVendido || 0
  } catch (err) {
    console.error('Erro ao gerar relatório:', err)
    resultado.value = null
  }
}

const exportarPDF = () => {
  if (!resultado.value) return
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Relatório de Serviços e Produtos', 14, 18)
  doc.setFontSize(12)
  doc.text(`Total: Kz ${totalGeral.value.toFixed(2)}`, 14, 28)
  doc.text(`Total serviços (Kz): ${resultado.value.totalServicosVendidos || 0}`, 14, 36)
  doc.text(`Total produtos (Kz): ${resultado.value.totalProdutosVendidos || 0}`, 14, 42)
  if (incluirDespesas.value) {
    doc.text(`Despesas: ${resultado.value.totalDespesas || 0}`, 14, 48)
    doc.text(`Saldo: ${resultado.value.saldo || 0}`, 14, 54)
  }
  const rows: any[] = []
  resultado.value.detalhesServicos?.forEach((s: any) =>
    rows.push(['Serviço', s.nome, s.quantidade, s.total?.toFixed(2) || '0.00', s.media?.toFixed(2) || '0.00'])
  )
  resultado.value.detalhesProdutos?.forEach((p: any) =>
    rows.push(['Produto', p.nome, p.quantidade, p.total?.toFixed(2) || '0.00', p.media?.toFixed(2) || '0.00'])
  )
  autoTable(doc, { head: [['Tipo', 'Nome', 'Qtd', 'Total (Kz)', 'Média (Kz)']], body: rows, startY: 60 })
  doc.save(`relatorio-${new Date().toISOString()}.pdf`)
}

const formatarKz = (valor: number | null | undefined) =>
  typeof valor === 'number'
    ? valor.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })
    : 'Kz 0,00'

const formatarData = (data: string | null | undefined) =>
  data
    ? new Date(data).toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : ''
</script>
