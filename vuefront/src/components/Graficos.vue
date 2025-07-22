<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="10" class="text-center mb-8">
        <h2 class="titulo-graficos">
          📊 Análise Financeira do Salão
        </h2>
        <p class="subtitulo-graficos">
          Visualize comparativos mensais, desempenho de funcionários e serviços mais populares.
        </p>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12" md="6" class="mb-4">
        <v-card class="grafico-card">
          <div class="grafico-titulo">
            <v-icon color="primary" size="20" class="mr-1">mdi-chart-bar</v-icon>
            Receita - Despesas por Mês (Saldo)
          </div>
          <BarChart :dados="graficoFinanceiro" />
        </v-card>
      </v-col>

      <v-col cols="12" md="6" class="mb-4">
        <v-card class="grafico-card">
          <div class="grafico-titulo">
            <v-icon color="primary" size="20" class="mr-1">mdi-account-group</v-icon>
            Vendas por Funcionário
          </div>
          <BarChart :dados="graficoFuncionarios" />
        </v-card>
      </v-col>

      <v-col cols="12" md="6" class="mb-4">
        <v-card class="grafico-card">
          <div class="grafico-titulo">
            <v-icon color="primary" size="20" class="mr-1">mdi-star</v-icon>
            Serviços Mais Vendidos
          </div>
          <div class="grafico-pizza-wrapper">
            <PieChart :dados="graficoServicos" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" class="mb-4">
        <v-card class="grafico-card">
          <div class="grafico-titulo">
            <v-icon color="primary" size="20" class="mr-1">mdi-cash-sync</v-icon>
            Total de Receitas x Despesas
          </div>
          <div class="grafico-pizza-wrapper">
            <PieChart :dados="graficoResumoReceitaDespesa" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="erro" type="error" class="mt-6 text-center">
      {{ erro }}
    </v-alert>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';
import BarChart from './BarChart.vue';
import PieChart from './PieChart.vue';

export default defineComponent({
  name: 'Graficos',
  components: {
    BarChart,
    PieChart,
  },
  setup() {
    const erro = ref('');
    const graficoFinanceiro = ref<any[]>([]);
    const graficoFuncionarios = ref<any[]>([]);
    const graficoServicos = ref<any[]>([]);
    const graficoResumoReceitaDespesa = ref<{ nome: string; quantidade: number }[]>([]);

    const carregarDados = async () => {
      try {
        const { data } = await axios.get('/painel-analitico/graficos');

        graficoFinanceiro.value = data.financeiro;
        graficoFuncionarios.value = data.funcionarios;
        graficoServicos.value = data.servicos;

        const receitaTotal = data.receitaDespesaDetalhado?.receita?.reduce(
          (acc: number, r: any) => acc + parseFloat(r.quantidade), 0
        ) || 0;

        const despesaTotal = data.receitaDespesaDetalhado?.despesa?.reduce(
          (acc: number, d: any) => acc + parseFloat(d.quantidade), 0
        ) || 0;

        graficoResumoReceitaDespesa.value = [
          { nome: 'Receitas', quantidade: receitaTotal },
          { nome: 'Despesas', quantidade: despesaTotal }
        ];
      } catch (err: any) {
        erro.value = err.response?.data?.erro || 'Erro ao carregar os gráficos.';
      }
    };

    onMounted(carregarDados);

    return {
      erro,
      graficoFinanceiro,
      graficoFuncionarios,
      graficoServicos,
      graficoResumoReceitaDespesa
    };
  }
});
</script>

<style scoped>
.titulo-graficos {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(90deg, #1976d2, #42a5f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
}

.subtitulo-graficos {
  font-size: 1.1rem;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.grafico-card {
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.grafico-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(33, 150, 243, 0.1);
}

.grafico-titulo {
  font-weight: 600;
  font-size: 1rem;
  color: #444;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.grafico-pizza-wrapper {
  max-width: 300px;
  margin: 0 auto;
}
</style>
