<template>
  <v-container
    fluid
    class="py-10"
    style="background: linear-gradient(to right, #fce4ec, #f8bbd0); min-height: 100vh;"
  >
    <v-row justify="center">
      <v-col cols="12" md="10" class="text-center">
        <h2 class="titulo-painel">
          📊 Monitoramento - {{ labelPeriodo }}
        </h2>
        <p class="subtitulo-painel">
          Acompanhe os principais números do seu salão neste período. Esses indicadores ajudam a entender o crescimento e os pontos de atenção.
        </p>

        <v-select
          v-model="periodoSelecionado"
          :items="opcoesPeriodo"
          label="Período"
          dense
          outlined
          color="pink accent-3"
          class="mt-4"
          style="max-width: 200px; margin: 0 auto;"
          item-title="text"
          item-value="value"
          :disabled="loading"
        />

        <v-progress-circular
          v-if="loading"
          indeterminate
          color="pink accent-3"
          size="40"
          class="mt-6"
        />
      </v-col>
    </v-row>

    <v-row dense v-if="!loading">
      <v-col
        cols="12"
        sm="6"
        md="4"
        v-for="(card, index) in cards"
        :key="index"
      >
        <v-card
          elevation="6"
          class="card-indicador pa-4 rounded-lg d-flex flex-column justify-space-between align-center"
        >
          <div class="icon-circle mb-2">
            <v-icon size="32" color="pink accent-3">{{ card.icon }}</v-icon>
          </div>
          <div class="text-caption text-center font-weight-medium text-grey-darken-2">
            {{ card.title }}
          </div>
          <div class="text-h5 text-center font-weight-bold text-primary mt-1">
            {{ card.value }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-10" v-if="!loading">
      <v-col cols="12">
        <detalhe-pro-serv-dash />
      </v-col>
    </v-row>

    <v-alert v-if="erro" type="error" class="mt-4" dense>
      {{ erro }}
    </v-alert>

    <v-divider class="my-10" />

    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 font-weight-medium mb-2">📈 Gráficos de Desempenho</h3>
        <p class="mb-4 text-body-2 text-grey-darken-1">
          Visualize receitas e despesas ao longo do tempo para identificar padrões de crescimento ou queda.
        </p>
        <graficos />
      </v-col>
    </v-row>

    <v-divider class="my-10" />

    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 font-weight-medium mb-2">📋 Listagens Detalhadas</h3>
        <p class="mb-4 text-body-2 text-grey-darken-1">
          Consulte informações completas sobre serviços, vendas e movimentações financeiras.
        </p>
        <listagens-detalhadas />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import axios from 'axios';
import Graficos from '@/components/Graficos.vue';
import ListagensDetalhadas from '@/components/ListagensDetalhadas.vue';
import DetalheProServDash from '@/components/DetalheProServDash.vue';

export default defineComponent({
  name: 'PainelFinanceiro',
  components: {
    Graficos,
    ListagensDetalhadas,
    DetalheProServDash,
  },
  setup() {
    const erro = ref('');
    const loading = ref(false);
    const periodoSelecionado = ref('mes');

    const dados = ref({
      totalReceitas: 0,
      totalDespesas: 0,
      lucro: 0,
      ticketMedio: 0,
      funcionarioTop: '',
      clienteTop: '',  // Adicionando cliente destacado
      servicoTop: '',
      variacaoLucro: 0,
      totalServicos: 0,
      totalProdutos: 0,
    });

    const opcoesPeriodo = [
      { text: 'Hoje', value: 'hoje' },
      { text: 'Semana', value: 'semana' },
      { text: 'Mês', value: 'mes' },
      { text: 'Trimestre', value: 'trimestre' },
      { text: 'Semestre', value: 'semestre' },
      { text: 'Ano', value: 'ano' },
      { text: 'Todos', value: 'todos' },
    ];

    const formatarMoeda = (valor: number) =>
      `Kz ${valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    const cards = ref([
      { title: 'Receita Total', value: 'Kz 0,00', icon: 'mdi-cash-multiple' },
      { title: 'Despesa Total', value: 'Kz 0,00', icon: 'mdi-cash-minus' },
      { title: 'Lucro Líquido', value: 'Kz 0,00', icon: 'mdi-cash-plus' },
      { title: 'Funcionário Destacado', value: '-', icon: 'mdi-account-tie' },
      { title: 'Cliente Destacado', value: '-', icon: 'mdi-account' },  // Adicionando cartão de cliente destacado
      { title: 'Serviço Mais Demandado', value: '-', icon: 'mdi-star-check' },
      { title: 'Crescimento ou Queda do Lucro em %', value: '0%', icon: 'mdi-chart-line' },
      { title: 'Receita de Serviços', value: 'Kz 0,00', icon: 'mdi-cogs' },
      { title: 'Receita de Produtos', value: 'Kz 0,00', icon: 'mdi-cart' },
    ]);

    const carregarDados = async () => {
      erro.value = '';
      loading.value = true;
      try {
        const { data } = await axios.get('/painel/indicadores', {
          params: { periodo: periodoSelecionado.value },
        });

        dados.value = data;

        cards.value = [
          { title: 'Receita Total', value: formatarMoeda(Number(data.totalReceitas)), icon: 'mdi-cash-multiple' },
          { title: 'Despesa Total', value: formatarMoeda(Number(data.totalDespesas)), icon: 'mdi-cash-minus' },
          { title: 'Lucro Líquido', value: formatarMoeda(Number(data.lucro)), icon: 'mdi-cash-plus' },
          { title: 'Funcionário Destacado', value: data.funcionarioTop || 'N/A', icon: 'mdi-account-tie' },
          { title: 'Cliente Destacado', value: data.clienteTop || 'N/A', icon: 'mdi-account' },  // Atualizando o cartão de cliente destacado
          { title: 'Serviço Mais Demandado', value: data.servicoTop || 'N/A', icon: 'mdi-star-check' },
          { title: 'Lucro Percentual', value: `${Number(data.variacaoLucro).toFixed(2)}%`, icon: 'mdi-chart-line' },
          { title: 'Receita de Serviços', value: formatarMoeda(Number(data.totalServicos)), icon: 'mdi-cogs' },
          { title: 'Receita de Produtos', value: formatarMoeda(Number(data.totalProdutos)), icon: 'mdi-cart' },
        ];

        console.log('Dados carregados:', data);
      } catch (err: any) {
        erro.value = err.response?.data?.erro || 'Erro ao carregar indicadores.';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const labelPeriodo = computed(() => {
      const opcao = opcoesPeriodo.find(o => o.value === periodoSelecionado.value);
      return opcao ? opcao.text : 'Período';
    });

    watch(periodoSelecionado, () => {
      carregarDados();
    });

    onMounted(() => {
      carregarDados();
    });

    return {
      cards,
      erro,
      loading,
      periodoSelecionado,
      opcoesPeriodo,
      labelPeriodo,
    };
  },
});
</script>

<style scoped>
.card-indicador {
  background-color: white;
  border-radius: 10px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(216, 27, 96, 0.08); /* vinho */
  height: 150px;
  padding: 16px;
}

.card-indicador:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(216, 27, 96, 0.15);
}

.icon-circle {
  background-color: rgba(216, 27, 96, 0.1); /* rosa claro */
  border-radius: 50%;
  padding: 8px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.titulo-painel {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(90deg, #880e4f, #f06292); /* vinho para rosa */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
}

.subtitulo-painel {
  font-size: 1.1rem;
  color: #6a1b9a;
  max-width: 800px;
  margin: 0 auto 32px auto;
  line-height: 1.6;
}

.text-primary {
  color: #880e4f !important;
}
</style>
