<template>
  <v-container fluid class="py-6 px-4 bg-blue-grey-lighten-5">
    <!-- Título -->
    <v-card elevation="3" class="pa-6 mb-8 rounded-xl bg-white">
      <div class="d-flex align-center mb-6">
        <v-icon icon="mdi-account-group" size="36" class="me-3 text-primary" />
        <h2 class="text-h5 font-weight-bold text-primary">Relatório de Funcionários</h2>
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
        <h3 class="text-h6 font-weight-bold mb-4 text-blue-darken-3">
          Resultados para:
          <v-chip color="blue lighten-4" text-color="primary" class="ml-2">
            <v-icon start icon="mdi-calendar-month" />
            {{ periodoSelecionado }}
          </v-chip>
        </h3>

        <v-row dense>
          <v-col
            v-for="(item, index) in dadosRelatorio"
            :key="index"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card elevation="4" class="pa-5 rounded-2xl bg-white">
              <!-- Header com nome do funcionário -->
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

              <!-- Detalhes do atendimento -->
              <v-divider class="mb-3" />

              <v-row dense>
                <v-col cols="12" class="d-flex justify-space-between mb-2">
                  <span class="text-caption text-blue-grey-darken-1">Total de Atendimentos</span>
                  <span class="text-body-1 font-weight-bold text-primary">{{ item.atendimentos }}</span>
                </v-col>
                <v-col cols="12" class="d-flex justify-space-between mb-2">
                  <span class="text-caption text-blue-grey-darken-1">Receita Total</span>
                  <span class="text-body-1 font-weight-bold text-green-darken-2">
                    {{ formatarValor(item.receitaTotal) }}
                  </span>
                </v-col>
                <v-col cols="12" class="d-flex justify-space-between">
                  <span class="text-caption text-blue-grey-darken-1">Status</span>
                  <span class="text-body-1 font-weight-bold text-amber-darken-3">
                    {{ item.status }}
                  </span>
                </v-col>
                <v-col cols="12" class="d-flex justify-space-between">
                  <span class="text-caption text-blue-grey-darken-1">Último Atendimento</span>
                  <span class="text-body-1">{{ item.ultimoAtendimento }}</span>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- Nenhum dado -->
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
      'Esta Semana',
      'Este Mês',
      'Últimos 30 dias',
      'Trimestre Atual',
      'Personalizado'
    ]

    // Carregar funcionários ao montar a página
    onMounted(async () => {
      try {
        const res = await axios.get('/funcionarios')
        funcionarios.value = res.data
      } catch (err) {
        console.error('Erro ao carregar funcionários', err)
      }
    })

    // Calcular o intervalo de datas com base no período selecionado
    function calcularDatas() {
      const hoje = new Date()
      let inicio: Date
      const fim: Date = new Date()

      switch (periodoSelecionado.value) {
        case 'Hoje':
          inicio = new Date(hoje)
          break
        case 'Esta Semana':
          const dia = hoje.getDay()
          inicio = new Date(hoje)
          inicio.setDate(hoje.getDate() - dia)
          break
        case 'Este Mês':
          inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
          break
        case 'Últimos 30 dias':
          inicio = new Date(hoje)
          inicio.setDate(hoje.getDate() - 30)
          break
        case 'Trimestre Atual':
          const mes = hoje.getMonth()
          const trimestre = Math.floor(mes / 3)
          inicio = new Date(hoje.getFullYear(), trimestre * 3, 1)
          break
        case 'Personalizado':
          inicio = new Date(hoje)
          break
        default:
          inicio = new Date(hoje)
          break
      }

      return {
        inicio: inicio.toISOString().slice(0, 10),
        fim: fim.toISOString().slice(0, 10)
      }
    }

    // Função para gerar o relatório
    async function gerarRelatorio() {
      relatorioGerado.value = false
      carregando.value = true

      if (!funcionariosSelecionados.value.length) {
        dadosRelatorio.value = []
        carregando.value = false
        relatorioGerado.value = true
        return
      }

      const periodoMap: Record<string, string> = {
        'Hoje': 'hoje',
        'Esta Semana': 'semana',
        'Este Mês': 'mes',
        'Últimos 30 dias': 'personalizado',
        'Trimestre Atual': 'trimestre',
        'Personalizado': 'personalizado'
      }

      const periodo = periodoMap[periodoSelecionado.value]
      const { inicio, fim } = calcularDatas()

      try {
        const queryParams = new URLSearchParams({
          periodo,
          inicio,
          fim,
          funcionarios: funcionariosSelecionados.value.join(',')
        })

        const res = await axios.get(`/relatorio/funcionarios?${queryParams.toString()}`)
        dadosRelatorio.value = res.data
        relatorioGerado.value = true
      } catch (err) {
        console.error('Erro ao gerar o relatório', err)
      } finally {
        carregando.value = false
      }
    }

    // Função para formatar os valores em moeda
    function formatarValor(valor: number) {
      if (isNaN(valor)) return 'N/A'
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA'
      }).format(valor)
    }

    return {
      periodoSelecionado,
      funcionariosSelecionados,
      funcionarios,
      dadosRelatorio,
      relatorioGerado,
      carregando,
      periodos,
      calcularDatas,
      gerarRelatorio,
      formatarValor
    }
  }
})
</script>
