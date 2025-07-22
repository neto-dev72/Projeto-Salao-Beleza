<template>
  <v-container class="py-10" fluid>
    <v-row justify="center" dense>

      <!-- PRODUTOS -->
      <v-col cols="12" md="6">
        <v-card elevation="6" class="pa-6 pink-light-bg">
          <v-card-title class="text-h5 mb-4 primary-title">
            📦 Financeiro - Produtos
          </v-card-title>

          <v-row v-if="loading">
            <v-col cols="12" sm="6" v-for="n in 4" :key="n">
              <v-skeleton-loader type="card"></v-skeleton-loader>
            </v-col>
          </v-row>

          <v-alert v-else-if="produtos.length === 0" type="info" color="pink lighten-4">
            Nenhum produto encontrado.
          </v-alert>

          <v-row v-else>
            <v-col
              v-for="produto in produtos"
              :key="produto.id"
              cols="12"
              sm="6"
            >
              <v-hover v-slot="{ isHovering, props }">
                <v-card
                  v-bind="props"
                  :elevation="isHovering ? 12 : 4"
                  class="transition-swing pa-3 product-card"
                  color="pink lighten-5"
                  rounded
                >
                  <v-card-title class="text-subtitle-1 font-weight-bold product-title">
                    {{ produto.nome }}
                  </v-card-title>
                  <v-card-text>
                    <v-chip color="pink accent-3" text-color="white" class="ma-1">Estoque: {{ produto.quantidadeEstoque }}</v-chip>
                    <v-chip color="purple darken-2" text-color="white" class="ma-1">Vendida: {{ produto.quantidadeVendida }}</v-chip>
                    <div class="mt-3">
                      <div><strong>Custo:</strong> {{ formatCurrency(produto.precoCompra) }}</div>
                      <div><strong>Preço de Venda:</strong> {{ formatCurrency(produto.precoVenda) }}</div>
                      <div><strong>Receita Total:</strong> {{ formatCurrency(produto.totalVendido) }}</div>
                      <div><strong>Valor Investido:</strong> {{ formatCurrency(produto.totalInvestido) }}</div>
                      <div><strong>Ganho:</strong> {{ formatCurrency(produto.lucro) }}</div>
                      <div><strong>% de Ganho:</strong> {{ produto.margemLucroPercentual }}%</div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-hover>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- SERVIÇOS -->
      <v-col cols="12" md="6">
        <v-card elevation="6" class="pa-6 pink-light-bg">
          <v-card-title class="text-h5 mb-4 primary-title">
            💇‍♀️ Financeiro - Serviços
          </v-card-title>

          <v-row v-if="loading">
            <v-col cols="12" sm="6" v-for="n in 4" :key="n">
              <v-skeleton-loader type="card"></v-skeleton-loader>
            </v-col>
          </v-row>

          <v-alert v-else-if="servicos.length === 0" type="info" color="pink lighten-4">
            Nenhum serviço encontrado.
          </v-alert>

          <v-row v-else>
            <v-col
              v-for="servico in servicos"
              :key="servico.id"
              cols="12"
              sm="6"
            >
              <v-hover v-slot="{ isHovering, props }">
                <v-card
                  v-bind="props"
                  :elevation="isHovering ? 12 : 4"
                  class="transition-swing pa-3 service-card"
                  color="purple lighten-5"
                  rounded
                >
                  <v-card-title class="text-subtitle-1 font-weight-bold service-title">
                    {{ servico.nome }}
                  </v-card-title>
                  <v-card-text>
                    <v-chip color="pink accent-3" text-color="white" class="ma-1">Vendida: {{ servico.quantidadeVendida }}</v-chip>
                    <div class="mt-3">
                      <div><strong>Preço:</strong> {{ formatCurrency(servico.preco) }}</div>
                      <div><strong>Receita Total:</strong> {{ formatCurrency(servico.receitaTotal) }}</div>
                      <div><strong>Ganho:</strong> {{ formatCurrency(servico.lucroEstimado) }}</div>
                      <div><strong>Preço Médio:</strong> {{ formatCurrency(servico.precoMedio) }}</div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-hover>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

    </v-row>

    <!-- SESSÃO DE GRÁFICOS SEPARADA -->
    <v-row justify="center" class="mt-12" dense>
      <v-col cols="12" md="6">
        <v-card elevation="6" class="pa-6 pink-light-bg chart-card">
          <h3 class="text-h5 primary-title mb-6">💰 Investimento vs Ganho (Produtos)</h3>
          <PieChart v-if="dadosInvestimentoLucro.length" :dados="dadosInvestimentoLucro" />
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="6" class="pa-6 pink-light-bg chart-card">
          <h3 class="text-h5 primary-title mb-6">📊 Receita: Produtos vs Serviços</h3>
          <PieChart v-if="dadosReceitaProdutosServicos.length" :dados="dadosReceitaProdutosServicos" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import axios from 'axios'
import PieChart from './PieChart.vue' // ajuste o caminho conforme seu projeto

axios.defaults.withCredentials = true

export default defineComponent({
  name: 'FinanceiroProdutosServicos',
  components: { PieChart },
  setup() {
    const produtos = ref<any[]>([])
    const servicos = ref<any[]>([])
    const loading = ref(false)

    const formatCurrency = (value: number | string) => {
      if (!value) return 'Kz 0,00'
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
        minimumFractionDigits: 2
      }).format(Number(value))
    }

    const fetchDados = async () => {
      loading.value = true
      try {
        const { data } = await axios.get('/painel/financeiro-produtos-servicos')
        produtos.value = data.produtos || []
        servicos.value = data.servicos || []
      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error)
        alert('Erro ao carregar dados financeiros. Verifique sua conexão.')
      } finally {
        loading.value = false
      }
    }

    // Dados para gráfico receita produtos vs serviços
    const dadosReceitaProdutosServicos = computed(() => {
      const receitaProdutos = produtos.value.reduce((acc, p) => acc + Number(p.totalVendido), 0)
      const receitaServicos = servicos.value.reduce((acc, s) => acc + Number(s.receitaTotal), 0)
      return [
        { nome: 'Produtos', quantidade: receitaProdutos },
        { nome: 'Serviços', quantidade: receitaServicos }
      ]
    })

    // Dados para gráfico investimento vs lucro (apenas produtos)
    const dadosInvestimentoLucro = computed(() => {
      const investimento = produtos.value.reduce((acc, p) => acc + Number(p.totalInvestido), 0)
      const lucro = produtos.value.reduce((acc, p) => acc + Number(p.lucro), 0)
      return [
        { nome: 'Investimento', quantidade: investimento },
        { nome: 'Lucro', quantidade: lucro }
      ]
    })

    onMounted(() => {
      fetchDados()
    })

    return {
      produtos,
      servicos,
      loading,
      formatCurrency,
      dadosReceitaProdutosServicos,
      dadosInvestimentoLucro
    }
  }
})
</script>

<style scoped>
.primary-title {
  font-weight: bold;
  color: #880e4f;
  text-shadow: 0 1px 2px rgba(136, 14, 79, 0.2);
}

.product-card {
  background-color: #fce4ec !important;
  transition: transform 0.2s ease-in-out;
}

.service-card {
  background-color: #f3e5f5 !important;
  transition: transform 0.2s ease-in-out;
}

.product-card:hover,
.service-card:hover {
  transform: translateY(-5px);
}

.product-title,
.service-title {
  color: #6a1b9a;
}

.pink-light-bg {
  background: linear-gradient(to bottom, #fce4ec, #f8bbd0);
  border-radius: 12px;
}

/* Contraste melhorado para textos */
.v-card-text div {
  color: #4a148c;
  font-size: 0.95rem;
  line-height: 1.5;
  font-weight: 500;
}

.v-card-text strong {
  color: #880e4f;
}

/* Diminuir tamanho dos gráficos */
.chart-card {
  max-width: 400px; /* largura máxima */
  margin-left: auto;
  margin-right: auto;
}

.chart-card >>> canvas {
  max-width: 100% !important;
  max-height: 300px !important;
}
</style>
