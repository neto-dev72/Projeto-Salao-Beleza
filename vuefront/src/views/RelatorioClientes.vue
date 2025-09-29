<template>
  <v-container fluid class="py-6 px-4 bg-blue-grey-lighten-5">
    <!-- Título -->
    <v-card elevation="3" class="pa-6 mb-8 rounded-xl bg-white">
      <div class="d-flex align-center mb-6">
        <v-icon icon="mdi-account" size="36" class="me-3 text-primary" />
        <h2 class="text-h5 font-weight-bold text-primary">Relatório de Clientes</h2>
      </div>

      <!-- Filtro de Clientes -->
      <v-row dense class="mb-4">
        <v-col cols="12" sm="12">
          <v-autocomplete
            v-model="clientesSelecionados"
            :items="clientes"
            item-title="nome"
            item-value="id"
            label="Selecionar Clientes"
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
          Resultados para os Clientes Selecionados:
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
              <!-- Nome do Cliente -->
              <div class="d-flex align-center mb-4">
                <v-avatar size="48" color="blue lighten-3">
                  <v-icon icon="mdi-account-tie" />
                </v-avatar>
                <div class="ml-4">
                  <h4 class="text-subtitle-1 font-weight-bold mb-1 text-blue-darken-3">
                    {{ item.nome }}
                  </h4>
                </div>
              </div>

              <!-- Detalhes do Relatório -->
              <v-divider class="mb-3" />

              <v-row dense>
                <v-col cols="12" class="d-flex justify-space-between mb-2">
                  <span class="text-caption text-blue-grey-darken-1">Total Gasto</span>
                  <span class="text-body-1 font-weight-bold text-green-darken-2">
                    {{ formatarValor(item.totalGasto) }}
                  </span>
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
  name: 'RelatorioClientes',
  setup() {
    const clientesSelecionados = ref<number[]>([])
    const clientes = ref<any[]>([])
    const dadosRelatorio = ref<any[]>([])
    const relatorioGerado = ref(false)
    const carregando = ref(false)

    // Carregar clientes ao montar a página
    onMounted(async () => {
      try {
        const res = await axios.get('/clientes')
        clientes.value = res.data
      } catch (err) {
        console.error('Erro ao carregar clientes', err)
      }
    })

    // Função para gerar o relatório
    async function gerarRelatorio() {
      relatorioGerado.value = false
      carregando.value = true

      if (!clientesSelecionados.value.length) {
        dadosRelatorio.value = []
        carregando.value = false
        relatorioGerado.value = true
        return
      }

      try {
        const queryParams = new URLSearchParams({
          clientes: clientesSelecionados.value.join(','),
        })

        const res = await axios.get(`http://localhost:9000/relatorio/clientes?${queryParams.toString()}`);
dadosRelatorio.value = res.data;
console.log("Dados do relatório", dadosRelatorio.value);

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
      clientesSelecionados,
      clientes,
      dadosRelatorio,
      relatorioGerado,
      carregando,
      gerarRelatorio,
      formatarValor
    }
  }
})
</script>
