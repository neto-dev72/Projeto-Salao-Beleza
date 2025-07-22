<template>
  <div class="pa-4">
    <div class="text-center mb-6">
      <h2 class="titulo-painel">💼 Totais Gerais do Sistema</h2>
      <p class="subtitulo-painel">
        Veja um resumo consolidado das finanças do seu salão. Acompanhe o desempenho geral com clareza e estilo.
      </p>
    </div>

    <v-row dense>
      <v-col
        cols="12"
        sm="6"
        md="4"
        v-for="(card, index) in cardsGerais"
        :key="index"
      >
        <v-card
          elevation="8"
          class="pa-5 card-geral"
        >
          <div class="icon-circle mb-3 mx-auto">
            <v-icon size="36" color="deep-purple-accent-4">{{ card.icon }}</v-icon>
          </div>
          <div class="text-center font-weight-medium text-grey-darken-3 text-body-1">
            {{ card.title }}
          </div>
          <div class="text-center font-weight-bold valor-texto mt-1">
            {{ card.value }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="erro" type="error" class="mt-4">
      {{ erro }}
    </v-alert>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'TotaisGerais',
  setup() {
    const erro = ref('');
    const cardsGerais = ref([
      { title: 'Receita Geral', value: 'Kz 0,00', icon: 'mdi-cash-multiple' },
      { title: 'Despesas Gerais', value: 'Kz 0,00', icon: 'mdi-cash-minus' },
      { title: 'Lucro Geral', value: 'Kz 0,00', icon: 'mdi-cash-plus' },
    ]);

    const formatarMoeda = (valor: number) =>
      `Kz ${valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    const carregarTotais = async () => {
      try {
        const { data } = await axios.get('/painel/indicadores/geral');

        cardsGerais.value[0].value = formatarMoeda(data.totalReceitas);
        cardsGerais.value[1].value = formatarMoeda(data.totalDespesas);
        cardsGerais.value[2].value = formatarMoeda(data.lucro);
      } catch (err: any) {
        erro.value =
          err.response?.data?.erro || 'Erro ao carregar totais gerais.';
      }
    };

    onMounted(() => {
      carregarTotais();
    });

    return {
      cardsGerais,
      erro,
    };
  },
});
</script>

<style scoped>
.titulo-painel {
  font-size: 1.9rem;
  font-weight: 700;
  color: #512da8;
}

.subtitulo-painel {
  font-size: 1.05rem;
  color: #7e57c2;
  max-width: 600px;
  margin: 0 auto;
}

.card-geral {
  background-color: #fff; /* fundo branco */
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(81, 45, 168, 0.1);
}
.card-geral:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 26px rgba(81, 45, 168, 0.18);
}

.icon-circle {
  background-color: rgba(94, 53, 177, 0.1);
  border-radius: 50%;
  padding: 16px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.valor-texto {
  font-size: 1.25rem;
  color: #5e35b1;
}
</style>
