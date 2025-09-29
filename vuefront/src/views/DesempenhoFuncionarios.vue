<template>
  <v-container fluid class="py-6 px-4 bg-blue-grey-lighten-5">
    <!-- Cabeçalho / Título -->
    <v-card elevation="3" class="pa-6 mb-8 rounded-xl bg-white">
      <div class="d-flex align-center mb-6">
        <v-icon icon="mdi-account-group" size="36" class="me-3 text-primary" />
        <h2 class="text-h5 font-weight-bold text-primary">
          Relatório de Funcionários
        </h2>
      </div>

      <!-- Filtros -->
      <v-row dense class="mb-4">
        <v-col cols="12" sm="4">
          <v-select
            v-model="periodoSelecionado"
            :items="periodos"
            label="Período"
            prepend-icon="mdi-calendar-range"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" sm="8">
          <v-autocomplete
            v-model="funcionariosSelecionados"
            :items="funcionarios"
            item-title="nome"
            item-value="id"
            label="Selecionar Funcionários"
            multiple
            chips
            prepend-icon="mdi-account-multiple"
            variant="outlined"
            density="comfortable"
            class="custom-autocomplete"
          />
        </v-col>
      </v-row>

      <!-- Botão Gerar Relatório -->
      <div class="text-end mt-4">
        <v-btn
          :loading="carregando"
          color="primary"
          size="large"
          class="rounded-lg"
          prepend-icon="mdi-file-chart"
          @click="gerarRelatorio"
        >
          Gerar Relatório
        </v-btn>
      </div>
    </v-card>

    <!-- Resultados -->
    <v-expand-transition>
      <div v-if="relatorioGerado">
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-h6 font-weight-bold text-blue-darken-3">
            Resultados para:
            <v-chip color="blue lighten-4" text-color="primary" class="ml-2">
              <v-icon start icon="mdi-calendar-month" />
              {{ periodoSelecionado }}
            </v-chip>
          </h3>
          <v-btn
            v-if="dadosRelatorio.length"
            color="red-darken-1"
            class="text-white"
            rounded="xl"
            prepend-icon="mdi-file-pdf-box"
            @click="exportarPDF"
          >
            Exportar PDF
          </v-btn>
        </div>

        <v-row dense>
          <v-col
            v-for="(item, index) in dadosRelatorio"
            :key="index"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card elevation="4" class="pa-5 rounded-2xl bg-white">
              <div class="d-flex align-center mb-4">
                <v-avatar size="48" color="blue lighten-3">
                  <v-icon icon="mdi-account-tie" />
                </v-avatar>
                <div class="ml-4">
                  <h4 class="text-subtitle-1 font-weight-bold mb-1 text-blue-darken-3">
                    {{ item.nome }}
                  </h4>
                  <p class="text-body-2">{{ item.funcao }}</p>
                </div>
              </div>

              <v-divider class="mb-3" />

              <v-row dense>
                <v-col cols="12" class="d-flex justify-space-between mb-2">
                  <span class="text-caption text-blue-grey-darken-1">
                    Total de Atendimentos
                  </span>
                  <span class="text-body-1 font-weight-bold text-primary">
                    {{ item.atendimentos }}
                  </span>
                </v-col>
                <v-col cols="12" class="d-flex justify-space-between mb-2">
                  <span class="text-caption text-blue-grey-darken-1">
                    Receita Total
                  </span>
                  <span class="text-body-1 font-weight-bold text-green-darken-2">
                    {{ formatarValor(item.receitaTotal) }}
                  </span>
                </v-col>
                <v-col cols="12" class="d-flex justify-space-between mb-2">
                  <span class="text-caption text-blue-grey-darken-1">
                    Status
                  </span>
                  <span class="text-body-1 font-weight-bold text-amber-darken-3">
                    {{ item.status }}
                  </span>
                </v-col>
                <v-col cols="12" class="d-flex justify-space-between">
                  <span class="text-caption text-blue-grey-darken-1">
                    Último Atendimento
                  </span>
                  <span class="text-body-1">
                    {{ item.ultimoAtendimento }}
                  </span>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <v-alert
          type="info"
          v-if="!dadosRelatorio.length"
          class="mt-4"
          icon="mdi-information-outline"
        >
          Nenhum resultado para os filtros aplicados.
        </v-alert>
      </div>
    </v-expand-transition>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default defineComponent({
  name: 'RelatorioFuncionarios',
  setup() {
    const periodoSelecionado = ref('Hoje')
    const funcionariosSelecionados = ref<number[]>([])
    const funcionarios = ref<any[]>([])
    const dadosRelatorio = ref<any[]>([])
    const relatorioGerado = ref(false)
    const carregando = ref(false)

    const periodos = [
      'Hoje',
      'Semana',
      'Mês',
      'Trimestre',
      'Semestre',
      'Ano'
    ]

    onMounted(async () => {
      try {
        const res = await axios.get('/funcionarios')
        funcionarios.value = res.data
      } catch (err) {
        console.error('Erro ao carregar funcionários', err)
      }
    })

    function calcularPeriodo() {
      const agora = dayjs()
      let inicio: dayjs.Dayjs
      const fim: dayjs.Dayjs = agora.endOf('day')

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

    async function gerarRelatorio() {
      relatorioGerado.value = false
      carregando.value = true

      if (!funcionariosSelecionados.value.length) {
        dadosRelatorio.value = []
        carregando.value = false
        relatorioGerado.value = true
        return
      }

      const { startDate, endDate } = calcularPeriodo()

      try {
        const res = await axios.get('/relatorio/funcionarios', {
          params: {
            startDate,
            endDate,
            funcionarios: funcionariosSelecionados.value.join(',')
          }
        })
        dadosRelatorio.value = res.data
        relatorioGerado.value = true
      } catch (err) {
        console.error('Erro ao gerar relatório', err)
      } finally {
        carregando.value = false
      }
    }

    function formatarValor(valor: number) {
      if (isNaN(valor)) return 'N/A'
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA'
      }).format(valor)
    }

    function exportarPDF() {
      if (!dadosRelatorio.value.length) return
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text('Relatório de Funcionários', 14, 18)
      doc.setFontSize(12)
      doc.text(`Período: ${periodoSelecionado.value}`, 14, 28)

      const rows: any[] = []
      dadosRelatorio.value.forEach((f: any) => {
        rows.push([
          f.nome,
          f.funcao,
          f.atendimentos,
          formatarValor(f.receitaTotal),
          f.status,
          f.ultimoAtendimento
        ])
      })

      autoTable(doc, {
        head: [['Nome', 'Função', 'Atendimentos', 'Receita Total', 'Status', 'Último Atendimento']],
        body: rows,
        startY: 40
      })

      doc.save(`relatorio-funcionarios-${new Date().toISOString()}.pdf`)
    }

    return {
      periodoSelecionado,
      funcionariosSelecionados,
      funcionarios,
      dadosRelatorio,
      relatorioGerado,
      carregando,
      periodos,
      gerarRelatorio,
      formatarValor,
      exportarPDF
    }
  }
})
</script>

<style scoped>
.custom-autocomplete .v-chip {
  background-color: #e3f2fd;
  color: #1976d2;
}
</style>
