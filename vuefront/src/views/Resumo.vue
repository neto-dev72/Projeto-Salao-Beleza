<template>
  <v-container fluid class="pa-6">
    <!-- Título com ícone -->
    <v-row align="center" class="mb-8">
      <v-col cols="12" class="d-flex align-center">
        <v-icon size="40" color="blue-darken-2" class="mr-3">mdi-view-dashboard</v-icon>
        <div>
          <h1 class="text-h4 font-weight-bold text-blue-grey-darken-4">Painel de Controle</h1>
          <p class="text-body-1 text-grey-darken-1">
            Indicadores de desempenho do salão de beleza.
          </p>
        </div>
      </v-col>
    </v-row>

    <!-- Indicadores principais -->
    <v-row dense class="mb-6">
      <v-col cols="12" sm="4">
        <v-card class="elevation-1 pa-4 rounded-lg">
          <v-row align="center" justify="space-between">
            <div>
              <p class="text-subtitle-2 text-grey-darken-2 mb-1">Atendimentos Hoje</p>
              <h2 class="text-h5 font-weight-bold text-blue-darken-2">{{ atendimentosHoje }}</h2>
            </div>
            <v-icon size="32" color="blue-darken-2">mdi-account-group</v-icon>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="elevation-1 pa-4 rounded-lg">
          <v-row align="center" justify="space-between">
            <div>
              <p class="text-subtitle-2 text-grey-darken-2 mb-1">Total Vendas Hoje</p>
              <h2 class="text-h5 font-weight-bold text-blue-darken-2">
                Kz {{ totalVendasHoje.toFixed(2) }}
              </h2>
            </div>
            <v-icon size="32" color="blue-darken-2">mdi-currency-usd</v-icon>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="elevation-1 pa-4 rounded-lg">
          <v-row align="center" justify="space-between">
            <div>
              <p class="text-subtitle-2 text-grey-darken-2 mb-1">Vendas da Semana</p>
              <h2 class="text-h5 font-weight-bold text-blue-darken-2">
                Kz {{ vendasSemana.toFixed(2) }}
              </h2>
            </div>
            <v-icon size="32" color="blue-darken-2">mdi-chart-line</v-icon>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Aqui vamos colocar o componente ProdutoResumo -->
    <produto-resumo />

    <!-- Gráficos -->
    <v-row dense class="mb-6 mt-6">
      <v-col cols="12" md="6">
        <v-card class="elevation-1 pa-4 rounded-lg">
          <p class="text-subtitle-2 text-grey-darken-2 mb-2 d-flex align-center">
            <v-icon size="20" color="blue-darken-2" class="mr-1">mdi-calendar-week</v-icon>
            Vendas da Semana
          </p>
          <div v-if="!carregando">
            <LineChart :dados="dadosLinha" />
          </div>
          <v-skeleton-loader v-else type="image" />
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="elevation-1 pa-4 rounded-lg">
          <p class="text-subtitle-2 text-grey-darken-2 mb-2 d-flex align-center">
            <v-icon size="20" color="blue-darken-2" class="mr-1">mdi-star-circle</v-icon>
            Serviços Mais Vendidos
          </p>
          <div v-if="!carregando">
            <BarChart :dados="dadosBarra" />
          </div>
          <v-skeleton-loader v-else type="image" />
        </v-card>
      </v-col>
    </v-row>

    <!-- Botão de ação -->
    <v-row>
      <v-col cols="12" class="text-right">
        <v-btn color="blue-darken-2" class="text-white" @click="registrarVenda" variant="elevated">
          <v-icon start>mdi-plus</v-icon>
          Registrar Nova Venda
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';
import LineChart from '@/components/LineChart.vue';
import BarChart from '@/components/BarChart.vue';
// Importa o ProdutoResumo aqui, ajuste o caminho conforme seu projeto
import ProdutoResumo from '@/components/produtoresumo.vue';

export default defineComponent({
  name: 'Dashboard',
  components: {
    LineChart,
    BarChart,
    ProdutoResumo
  },
  setup() {
    const atendimentosHoje = ref(0);
    const totalVendasHoje = ref(0);
    const vendasSemana = ref(0);

    const dadosLinha = ref<{ dia: string; total: number }[]>([]);
    const dadosBarra = ref<{ nome: string; quantidade: number }[]>([]);

    const carregando = ref(true);

    const registrarVenda = () => {
      console.log('Navegar para registro de venda');
      // router.push('/nova-venda')
    };

    onMounted(async () => {
      try {
        const response = await axios.get('/dashboard');
        const data = response.data;

        atendimentosHoje.value = data.quantidadeAtendimentosHoje;
        totalVendasHoje.value = data.totalVendasHoje;
        vendasSemana.value = data.vendasDaSemana;

        dadosBarra.value = data.servicosMaisVendidosSemana.map((item: any) => ({
          nome: item.nome,
          quantidade: item.quantidade
        }));

        dadosLinha.value = data.vendasPorDiaSemana;

        carregando.value = false;
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        carregando.value = false;
      }
    });

    return {
      atendimentosHoje,
      totalVendasHoje,
      vendasSemana,
      dadosLinha,
      dadosBarra,
      carregando,
      registrarVenda
    };
  }
});
</script>
