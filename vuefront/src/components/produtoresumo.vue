<template>
  <v-container fluid class="py-8">
    <v-row justify="center" dense>

      <!-- Receita Total em Produtos -->
      <v-col cols="12" sm="6" md="4" lg="4" class="mb-6">
        <v-card class="elevation-1 pa-4 rounded-lg d-flex flex-column align-center">
          <v-icon size="48" color="blue-darken-2">mdi-cash-multiple</v-icon>
          <h2 class="text-h6 font-weight-bold mt-2 text-center text-blue-darken-2">
            Receita Total em Produtos (Mês Atual)
          </h2>
          <div class="text-h4 font-weight-bold mt-auto text-blue-darken-2">
            {{ formatCurrency(receitaTotalProdutos) }}
          </div>
        </v-card>
      </v-col>

      <!-- Receita Total em Serviços -->
      <v-col cols="12" sm="6" md="4" lg="4" class="mb-6">
        <v-card class="elevation-1 pa-4 rounded-lg d-flex flex-column align-center">
          <v-icon size="48" color="blue-darken-2">mdi-cash-check</v-icon>
          <h2 class="text-h6 font-weight-bold mt-2 text-center text-blue-darken-2">
            Receita Total em Serviços (Mês Atual)
          </h2>
          <div class="text-h4 font-weight-bold mt-auto text-blue-darken-2">
            {{ formatCurrency(receitaTotalServicos) }}
          </div>
        </v-card>
      </v-col>

      <!-- Alerta Estoque Baixo -->
      <v-col cols="12" sm="6" md="4" lg="4" v-if="alertaEstoqueBaixo.length">
        <v-card class="elevation-1 pa-4 rounded-lg d-flex flex-column border-left-red">
          <div class="d-flex align-center mb-4 flex-wrap">
            <v-avatar size="48" color="red darken-2" class="mr-3 mb-2">
              <v-icon size="32" color="white">mdi-alert-circle</v-icon>
            </v-avatar>
            <div class="flex-1 min-w-0">
              <h3 class="text-h5 font-extrabold text-red mb-1">
                ⚠️ Estoque Baixo - Atenção!
              </h3>
              <p class="text-subtitle2 mb-0 red--text text--darken-2 opacity-75">
                {{ alertaEstoqueBaixo.length }} produtos em risco de faltar,
                sendo {{ esgotadosCount }} esgotados
              </p>
            </div>
          </div>

          <v-divider class="mb-4" color="red darken-2" />

          <v-list dense class="overflow-y-auto" style="max-height: 240px;">
            <v-list-item
              v-for="produto in alertaEstoqueBaixo"
              :key="produto.id"
              class="mb-3 rounded-lg"
            >
              <v-list-item-content>
                <v-list-item-title class="font-bold red--text">
                  {{ produto.nome }}
                </v-list-item-title>
                <v-list-item-subtitle class="font-medium red--text opacity-80">
                  Estoque: <span class="text-h6 font-extrabold">{{ produto.quantidadeEstoque }}</span>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Produtos Mais Lucrativos -->
      <v-col cols="12" sm="6" md="4" lg="4" class="mb-6" v-if="produtosMaisLucrativos.length">
        <v-card class="elevation-1 pa-4 rounded-lg">
          <h3 class="text-h6 font-weight-bold text-blue-darken-2 mb-4">
            📈 Produtos Mais Lucrativos
          </h3>
          <v-list dense two-line>
            <v-list-item v-for="produto in produtosMaisLucrativos" :key="produto.id">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold blue-darken-2">
                  {{ produto.nome }}
                </v-list-item-title>
                <v-list-item-subtitle class="blue-darken-2">
                  Lucro: {{ formatCurrency(produto.lucro) }} | Receita: {{ formatCurrency(produto.receita) }} | Estoque: {{ produto.quantidadeEstoque }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Produtos Menos Lucrativos -->
      <v-col cols="12" sm="6" md="4" lg="4" class="mb-6" v-if="produtosMenosLucrativos.length">
        <v-card class="elevation-1 pa-4 rounded-lg">
          <h3 class="text-h6 font-weight-bold text-blue-darken-2 mb-4">
            📉 Produtos Menos Lucrativos
          </h3>
          <v-list dense two-line>
            <v-list-item v-for="produto in produtosMenosLucrativos" :key="produto.id">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold blue-darken-2">
                  {{ produto.nome }}
                </v-list-item-title>
                <v-list-item-subtitle class="blue-darken-2">
                  Lucro: {{ formatCurrency(produto.lucro) }} | Receita: {{ formatCurrency(produto.receita) }} | Estoque: {{ produto.quantidadeEstoque }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Serviços Mais Lucrativos -->
      <v-col cols="12" sm="6" md="4" lg="4" class="mb-6" v-if="servicosMaisLucrativos.length">
        <v-card class="elevation-1 pa-4 rounded-lg">
          <h3 class="text-h6 font-weight-bold text-blue-darken-2 mb-4">
            📈 Serviços Mais Lucrativos
          </h3>
          <v-list dense two-line>
            <v-list-item v-for="servico in servicosMaisLucrativos" :key="servico.id">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold blue-darken-2">
                  {{ servico.nome }}
                </v-list-item-title>
                <v-list-item-subtitle class="blue-darken-2">
                  Lucro: {{ formatCurrency(servico.lucro) }} | Receita: {{ formatCurrency(servico.receita) }} | Quantidade Vendida: {{ servico.quantidadeVendida }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Serviços Menos Lucrativos -->
      <v-col cols="12" sm="6" md="4" lg="4" class="mb-6" v-if="servicosMenosLucrativos.length">
        <v-card class="elevation-1 pa-4 rounded-lg">
          <h3 class="text-h6 font-weight-bold text-blue-darken-2 mb-4">
            📉 Serviços Menos Lucrativos
          </h3>
          <v-list dense two-line>
            <v-list-item v-for="servico in servicosMenosLucrativos" :key="servico.id">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold blue-darken-2">
                  {{ servico.nome }}
                </v-list-item-title>
                <v-list-item-subtitle class="blue-darken-2">
                  Lucro: {{ formatCurrency(servico.lucro) }} | Receita: {{ formatCurrency(servico.receita) }} | Quantidade Vendida: {{ servico.quantidadeVendida }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Loading -->
      <v-col cols="12" class="text-center" v-if="loading">
        <v-progress-circular indeterminate color="blue-darken-2" size="64" width="6"></v-progress-circular>
        <div class="mt-2 font-weight-medium blue-darken-2">Carregando dados...</div>
      </v-col>

      <!-- Error -->
      <v-col cols="12" class="text-center" v-if="errorMsg">
        <v-alert type="error" dense outlined>
          {{ errorMsg }}
        </v-alert>
      </v-col>

    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const alertaEstoqueBaixo = ref([])
const receitaTotalProdutos = ref(0)
const receitaTotalServicos = ref(0)
const produtosMaisLucrativos = ref([])
const produtosMenosLucrativos = ref([])
const servicosMaisLucrativos = ref([])
const servicosMenosLucrativos = ref([])
const loading = ref(false)
const errorMsg = ref('')

const formatCurrency = (value: number | string) => {
  if (!value) return 'Kz 0,00'
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2
  }).format(Number(value))
}

const esgotadosCount = computed(() =>
  alertaEstoqueBaixo.value.filter(p => p.quantidadeEstoque === 0).length
)

const fetchResumoProdutos = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await axios.get('/produtoresumo')
    alertaEstoqueBaixo.value = data.alertaEstoqueBaixo || []
    receitaTotalProdutos.value = parseFloat(data.receitaTotalProdutos) || 0
    receitaTotalServicos.value = parseFloat(data.receitaTotalServicos) || 0
    produtosMaisLucrativos.value = data.produtosMaisLucrativos || []
    produtosMenosLucrativos.value = data.produtosMenosLucrativos || []
    servicosMaisLucrativos.value = data.servicosMaisLucrativos || []
    servicosMenosLucrativos.value = data.servicosMenosLucrativos || []
  } catch (error) {
    errorMsg.value = 'Erro ao carregar dados do resumo dos produtos e serviços.'
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchResumoProdutos()
})
</script>

<style scoped>
.text-blue-darken-2 {
  color: #1976d2 !important;
}

.text-red {
  color: #d32f2f !important;
}

.border-left-red {
  border-left: 4px solid #d32f2f;
}
</style>
