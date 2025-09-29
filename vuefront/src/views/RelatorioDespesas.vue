<template>
  <v-container class="py-12">
    <v-card
      class="pa-10 mx-auto"
      max-width="800"
      elevation="8"
      rounded="2xl"
      style="background: linear-gradient(to bottom right, #F3F8FE, #D8E3F8)"
    >
      <!-- CABEÇALHO -->
      <div class="text-center mb-10">
        <v-icon size="48" color="blue-grey" class="mb-3">mdi-cash-multiple</v-icon>
        <h2 class="text-h4 font-weight-bold mb-2">Relatório de Despesas</h2>
        <p class="text-body-1 text-blue-grey">
          Visualize todas as despesas registradas em um período selecionado.
        </p>
      </div>

      <!-- FILTROS -->
      <v-row dense class="mb-8">
        <!-- Seleção de Período -->
        <v-col cols="12" md="6">
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
        <v-col cols="12" md="6" class="d-flex align-end">
          <v-btn
            block
            size="large"
            color="light-blue"
            class="text-white"
            @click="gerarRelatorio"
            rounded="xl"
            elevation="2"
          >
            <v-icon left>mdi-file-chart</v-icon>
            Gerar Relatório
          </v-btn>
        </v-col>
      </v-row>

      <!-- RESULTADO -->
      <div v-if="resultado && resultado.length">
        <v-divider class="mb-8"></v-divider>

        <div class="text-right mb-4">
          <v-btn color="purple-lighten-4" @click="exportarPDF" class="text-white" rounded="xl">
            <v-icon left>mdi-file-pdf-box</v-icon>
            PDF
          </v-btn>
        </div>

        <v-sheet class="pa-4 bg-white rounded-xl">
          <h3 class="text-subtitle-1 font-weight-bold mb-4">
            <v-icon left class="mr-2">mdi-calendar</v-icon>
            Despesas no Período
          </h3>

          <v-table density="comfortable">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Valor (Kz)</th>
                <th>Tipo</th>
                <th>Data</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in resultado" :key="d.id">
                <td>{{ d.descricao }}</td>
                <td>{{ formatarKz(d.valor) }}</td>
                <td>{{ d.tipo }}</td>
                <td>{{ formatarData(d.dataDespesa) }}</td>
                <td>{{ d.observacoes || '-' }}</td>
              </tr>
            </tbody>
          </v-table>

          <v-alert type="success" variant="tonal" rounded="xl" class="mt-6">
            <v-icon class="mr-2">mdi-cash-multiple</v-icon>
            <strong>Total de Despesas:</strong> {{ formatarKz(totalDespesas) }}
          </v-alert>
        </v-sheet>

        <!-- GRÁFICO DE PIZZA -->
        <v-sheet class="pa-6 mt-8 bg-white rounded-xl">
          <h3 class="text-subtitle-1 font-weight-bold mb-4">
            <v-icon left class="mr-2">mdi-chart-pie</v-icon>
            Distribuição: Fixa vs Variável
          </h3>
          <div class="grafico-container">
            <canvas id="graficoDespesas"></canvas>
          </div>
        </v-sheet>
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
        Nenhuma despesa encontrada para o período selecionado.
      </v-alert>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import Chart from 'chart.js/auto'

const periodoSelecionado = ref('Hoje')
const periodos = ['Hoje', 'Semana', 'Mês', 'Trimestre', 'Semestre', 'Ano']

const resultado = ref<any[] | null>(null)
const totalDespesas = ref(0)
let chartInstance: any = null

function calcularPeriodo() {
  const agora = dayjs()
  let inicio
  const fim = agora.endOf('day')

  switch (periodoSelecionado.value) {
    case 'Hoje':
      inicio = agora.startOf('day')
      break
    case 'Semana':
      inicio = agora.subtract(6, 'day').startOf('day')
      break
    case 'Mês':
      inicio = agora.startOf('month')
      break
    case 'Trimestre':
      const tri = Math.floor(agora.month() / 3)
      inicio = dayjs(new Date(agora.year(), tri * 3, 1))
      break
    case 'Semestre':
      inicio = agora.month() < 6
        ? dayjs(new Date(agora.year(), 0, 1))
        : dayjs(new Date(agora.year(), 6, 1))
      break
    case 'Ano':
      inicio = agora.startOf('year')
      break
    default:
      inicio = agora.startOf('month')
  }

  return { startDate: inicio.format('YYYY-MM-DD'), endDate: fim.format('YYYY-MM-DD') }
}

const gerarRelatorio = async () => {
  const { startDate, endDate } = calcularPeriodo()
  try {
    const res = await axios.get('/relatorio/despesas', { params: { startDate, endDate } })
    resultado.value = res.data
    totalDespesas.value = res.data.reduce((acc: number, d: any) => acc + parseFloat(d.valor), 0)
    await nextTick()
    gerarGrafico()
  } catch (err) {
    console.error('Erro ao gerar relatório:', err)
    resultado.value = null
  }
}

const gerarGrafico = () => {
  if (!resultado.value) return
  const fixas = resultado.value.filter(d => d.tipo === 'fixa').reduce((acc, d) => acc + parseFloat(d.valor), 0)
  const variaveis = resultado.value.filter(d => d.tipo === 'variavel').reduce((acc, d) => acc + parseFloat(d.valor), 0)

  if (chartInstance) chartInstance.destroy()

  const ctx: any = document.getElementById('graficoDespesas')
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Fixas', 'Variáveis'],
      datasets: [{
        data: [fixas, variaveis],
        backgroundColor: ['#1976d2', '#ef5350']
      }]
    },
    options: {
      responsive: false, // respeita tamanho definido no CSS
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { callbacks: { label: (context: any) => `${context.label}: Kz ${context.raw.toLocaleString()}` } }
      }
    }
  })
}

const exportarPDF = () => {
  if (!resultado.value || !resultado.value.length) return
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Relatório de Despesas', 14, 18)
  doc.setFontSize(12)
  doc.text(`Total de Despesas: Kz ${totalDespesas.value.toFixed(2)}`, 14, 28)

  const rows = resultado.value.map(d => [
    d.descricao,
    parseFloat(d.valor).toFixed(2),
    d.tipo,
    dayjs(d.dataDespesa).format('DD/MM/YYYY'),
    d.observacoes || '-'
  ])

  autoTable(doc, { head: [['Descrição', 'Valor (Kz)', 'Tipo', 'Data', 'Observações']], body: rows, startY: 36 })
  doc.save(`relatorio-despesas-${new Date().toISOString()}.pdf`)
}

const formatarKz = (valor: number | string) =>
  typeof valor === 'number'
    ? valor.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })
    : parseFloat(valor).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })

const formatarData = (data: string) => (data ? dayjs(data).format('DD/MM/YYYY') : '')
</script>

<style scoped>
.grafico-container {
  max-width: 400px;   /* largura máxima do gráfico */
  max-height: 300px;  /* altura máxima do gráfico */
  margin: 0 auto;     /* centraliza o gráfico */
}
</style>
