<template>
  <v-container fluid class="py-8">
    <v-row justify="center" dense>

      <!-- Receita Total em Produtos -->
      <v-col cols="12" sm="4" md="4" lg="4" class="mb-6">
        <v-sheet
          class="pa-6 pink-light-bg elevation-6 rounded-lg d-flex flex-column align-center"
          height="180"
        >
          <v-icon size="48" color="deep-purple lighten-1">mdi-cash-multiple</v-icon>
          <h2 class="text-h6 font-weight-bold mt-2 primary-title text-center">
            Receita Total em Produtos (Mês Atual)
          </h2>
          <div class="text-h4 font-weight-bold mt-auto text--primary">
            {{ formatCurrency(receitaTotalProdutos) }}
          </div>
          <v-progress-linear
            :value="calcPercentReceitaProdutos"
            color="deep-purple lighten-1"
            height="6"
            class="mt-4 rounded"
          />
        </v-sheet>
      </v-col>

      <!-- Receita Total em Serviços -->
      <v-col cols="12" sm="4" md="4" lg="4" class="mb-6">
        <v-sheet
          class="pa-6 pink-light-bg elevation-6 rounded-lg d-flex flex-column align-center"
          height="180"
        >
          <v-icon size="48" color="pink lighten-1">mdi-cash-check</v-icon>
          <h2 class="text-h6 font-weight-bold mt-2 primary-title text-center">
            Receita Total em Serviços (Mês Atual)
          </h2>
          <div class="text-h4 font-weight-bold mt-auto text--primary">
            {{ formatCurrency(receitaTotalServicos) }}
          </div>
          <v-progress-linear
            :value="calcPercentReceitaServicos"
            color="pink lighten-1"
            height="6"
            class="mt-4 rounded"
          />
        </v-sheet>
      </v-col>

      <!-- Alerta Estoque Baixo -->
      <v-col cols="12" sm="4" md="4" lg="4" v-if="alertaEstoqueBaixo.length">
        <v-card
          elevation="12"
          :color="temEsgotados ? 'deep-purple darken-4' : 'red darken-4'"
          rounded
          class="pa-6 d-flex flex-column"
        >
          <div class="d-flex align-center mb-4">
            <v-avatar
              size="48"
              :color="temEsgotados ? 'deep-purple accent-4' : 'red accent-4'"
              class="mr-3"
            >
              <v-icon size="32" color="white">mdi-alert-circle</v-icon>
            </v-avatar>
            <div>
              <h3 class="text-h5 font-extrabold white--text mb-1">
                ⚠️ Estoque Baixo - Atenção!
              </h3>
              <p class="white--text opacity-75 text-subtitle2 mb-0">
                {{ alertaEstoqueBaixo.length }} produtos em risco de faltar,
                sendo {{ esgotadosCount }} esgotados
              </p>
            </div>
          </div>

          <v-divider class="mb-4" :color="temEsgotados ? 'deep-purple accent-3' : 'red accent-3'" />

          <v-list
            dense
            class="overflow-y-auto"
            style="max-height: 240px;"
          >
            <v-list-item
              v-for="produto in alertaEstoqueBaixo"
              :key="produto.id"
              class="mb-3 rounded-lg"
              color="red lighten-5"
              elevation="2"
            >
              <v-list-item-content>
                <v-list-item-title class="font-bold" :class="produto.quantidadeEstoque === 0 ? 'deep-purple lighten-2 white--text' : 'red lighten-1'">
                  {{ produto.nome }}
                </v-list-item-title>
                <v-list-item-subtitle class="font-medium white--text opacity-80">
                  Estoque: <span class="text-h6 font-extrabold">{{ produto.quantidadeEstoque }}</span>
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-chip
                class="ma-0"
                :color="produto.quantidadeEstoque === 0 ? 'deep-purple accent-4' : 'red accent-3'"
                text-color="white"
                size="small"
                pill
                elevation="6"
              >
                <v-icon left small>
                  {{ produto.quantidadeEstoque === 0 ? 'mdi-close-circle' : 'mdi-alert' }}
                </v-icon>
                {{ produto.quantidadeEstoque === 0 ? 'ESGOTADO' : 'URGENTE' }}
              </v-chip>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Produtos Mais Lucrativos -->
      <v-col
        cols="12"
        sm="4"
        md="4"
        lg="4"
        class="mb-6"
        v-if="produtosMaisLucrativos.length"
      >
        <v-card elevation="4" class="pa-6 pink-light-bg rounded-lg">
          <h3 class="text-h6 font-weight-bold primary-title mb-4">
            📈 Produtos Mais Lucrativos
          </h3>
          <v-sparkline
            :value="produtosMaisLucrativos.map(p => p.lucro)"
            color="deep-purple"
            fill="rgba(103, 58, 183, 0.2)"
            height="40"
            class="mb-4"
          />
          <v-list dense two-line>
            <v-list-item
              v-for="produto in produtosMaisLucrativos"
              :key="produto.id"
            >
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">
                  {{ produto.nome }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  Lucro: {{ formatCurrency(produto.lucro) }} | Receita:
                  {{ formatCurrency(produto.receita) }} | Estoque:
                  {{ produto.quantidadeEstoque }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-chip
                color="deep-purple lighten-4"
                text-color="deep-purple darken-3"
                small
              >
                Lucro
              </v-chip>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Produtos Menos Lucrativos -->
      <v-col
        cols="12"
        sm="4"
        md="4"
        lg="4"
        class="mb-6"
        v-if="produtosMenosLucrativos.length"
      >
        <v-card elevation="4" class="pa-6 pink-light-bg rounded-lg">
          <h3 class="text-h6 font-weight-bold primary-title mb-4">
            📉 Produtos Menos Lucrativos
          </h3>
          <v-sparkline
            :value="produtosMenosLucrativos.map(p => p.lucro)"
            color="red lighten-1"
            fill="rgba(244, 67, 54, 0.2)"
            height="40"
            class="mb-4"
          />
          <v-list dense two-line>
            <v-list-item
              v-for="produto in produtosMenosLucrativos"
              :key="produto.id"
            >
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">
                  {{ produto.nome }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  Lucro: {{ formatCurrency(produto.lucro) }} | Receita:
                  {{ formatCurrency(produto.receita) }} | Estoque:
                  {{ produto.quantidadeEstoque }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-chip color="red lighten-4" text-color="red darken-3" small>
                Baixo Lucro
              </v-chip>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Serviços Mais Lucrativos -->
      <v-col
        cols="12"
        sm="4"
        md="4"
        lg="4"
        class="mb-6"
        v-if="servicosMaisLucrativos.length"
      >
        <v-card elevation="4" class="pa-6 pink-light-bg rounded-lg">
          <h3 class="text-h6 font-weight-bold primary-title mb-4">
            📈 Serviços Mais Lucrativos
          </h3>
          <v-sparkline
            :value="servicosMaisLucrativos.map(s => s.lucro)"
            color="pink darken-2"
            fill="rgba(233, 30, 99, 0.2)"
            height="40"
            class="mb-4"
          />
          <v-list dense two-line>
            <v-list-item
              v-for="servico in servicosMaisLucrativos"
              :key="servico.id"
            >
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">
                  {{ servico.nome }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  Lucro: {{ formatCurrency(servico.lucro) }} | Receita:
                  {{ formatCurrency(servico.receita) }} | Quantidade Vendida:
                  {{ servico.quantidadeVendida }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-chip color="pink lighten-4" text-color="pink darken-3" small>
                Lucro
              </v-chip>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Serviços Menos Lucrativos -->
      <v-col
        cols="12"
        sm="4"
        md="4"
        lg="4"
        class="mb-6"
        v-if="servicosMenosLucrativos.length"
      >
        <v-card elevation="4" class="pa-6 pink-light-bg rounded-lg">
          <h3 class="text-h6 font-weight-bold primary-title mb-4">
            📉 Serviços Menos Lucrativos
          </h3>
          <v-sparkline
            :value="servicosMenosLucrativos.map(s => s.lucro)"
            color="red lighten-2"
            fill="rgba(244, 67, 54, 0.15)"
            height="40"
            class="mb-4"
          />
          <v-list dense two-line>
            <v-list-item
              v-for="servico in servicosMenosLucrativos"
              :key="servico.id"
            >
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">
                  {{ servico.nome }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  Lucro: {{ formatCurrency(servico.lucro) }} | Receita:
                  {{ formatCurrency(servico.receita) }} | Quantidade Vendida:
                  {{ servico.quantidadeVendida }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-chip color="red lighten-4" text-color="red darken-3" small>
                Baixo Lucro
              </v-chip>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Loading -->
      <v-col cols="12" class="text-center" v-if="loading">
        <v-progress-circular
          indeterminate
          color="deep-purple"
          size="64"
          width="6"
        ></v-progress-circular>
        <div class="mt-2 font-weight-medium">Carregando dados...</div>
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

const totalReceita = computed(() => receitaTotalProdutos.value + receitaTotalServicos.value || 1)
const calcPercentReceitaProdutos = computed(() =>
  (receitaTotalProdutos.value / totalReceita.value) * 100
)
const calcPercentReceitaServicos = computed(() =>
  (receitaTotalServicos.value / totalReceita.value) * 100
)

// Computed para contar quantos produtos estão esgotados (estoque === 0)
const esgotadosCount = computed(() =>
  alertaEstoqueBaixo.value.filter(p => p.quantidadeEstoque === 0).length
)

// Computed para saber se há algum produto esgotado
const temEsgotados = computed(() =>
  alertaEstoqueBaixo.value.some(p => p.quantidadeEstoque === 0)
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
.primary-title {
  color: #880e4f;
  text-shadow: 0 1px 2px rgba(136, 14, 79, 0.3);
}

.pink-light-bg {
  background: linear-gradient(to bottom, #fce4ec, #f8bbd0);
}

.v-list-item.border-bottom {
  border-bottom: 1px solid rgba(136, 14, 79, 0.15);
}
</style>
