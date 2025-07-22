<template>
  <v-container class="py-10">
    <v-card elevation="6" class="pa-6 rounded-lg" color="grey lighten-4">
      <v-card-title class="text-h4 font-weight-bold d-flex justify-space-between align-center">
        <div class="d-flex align-center gap-3">
          <v-icon color="primary" size="36">mdi-cash-multiple</v-icon>
          <span>Lista de Despesas</span>
        </div>
        <v-btn color="primary" class="text-none" rounded elevation="2" prepend-icon="mdi-plus" @click="mostrarForm = true" :ripple="false">
          Nova Despesa
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="filtro"
          label="Pesquisar por descrição"
          clearable
          clear-icon="mdi-close-circle"
          append-icon="mdi-magnify"
          solo
          dense
          hide-details
          class="mb-6"
          color="primary"
        ></v-text-field>

        <v-data-table
          :headers="headers"
          :items="despesasFiltradas"
          :items-per-page="8"
          class="elevation-2"
          density="comfortable"
          :sort-by="['dataDespesa']"
          sort-desc
          :footer-props="{
            'items-per-page-options': [5, 8, 10, 15],
            'items-per-page-text': 'Linhas por página'
          }"
          item-key="id"
        >
          <template #item.valor="{ item }">
            <v-chip color="green lighten-2" text-color="white" pill>
              Kz {{ Number(item.valor).toFixed(2) }}
            </v-chip>
          </template>

          <template #item.dataDespesa="{ item }">
            {{ formatarData(item.dataDespesa) }}
          </template>

          <template #item.actions="{ item }">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  icon
                  color="info"
                  @click="verDetalhes(item)"
                  elevation="2"
                  class="mr-2"
                >
                  <v-icon size="24">mdi-eye</v-icon>
                </v-btn>
              </template>
              <span>Ver Detalhes</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  icon
                  color="error"
                  @click="abrirModalConfirmacao(item.id)"
                  elevation="2"
                >
                  <v-icon size="24">mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>Excluir</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Modal de cadastro -->
    <v-dialog v-model="mostrarForm" max-width="700" persistent scrollable>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h5">Cadastrar Despesa</span>
          <v-btn icon @click="mostrarForm = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <FormDespesas @despesa-cadastrada="aoCadastrarDespesa" @cancelar="mostrarForm = false" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Modal de detalhes -->
    <v-dialog v-model="mostrarDetalhes" max-width="800" transition="dialog-bottom-transition" scrollable>
      <v-card elevation="4" class="pa-0 rounded-lg">
        <v-sheet color="blue-grey lighten-5" class="py-4 px-6 text-left rounded-t-lg">
          <h2 class="text-h5 font-weight-bold text-blue-grey-darken-3 mb-0 d-flex align-center gap-2">
            <v-icon color="blue" size="28">mdi-file-document-outline</v-icon>
            Detalhes da Despesa
          </h2>
        </v-sheet>

        <v-card-text class="pa-6">
          <v-row dense>
            <v-col cols="12" sm="6" md="4" v-for="(campo, i) in detalhesCampos" :key="i">
              <v-card class="pa-4" outlined shaped>
                <strong class="text-blue text-subtitle-2 d-flex align-center mb-2 gap-2">
                  <v-icon size="20" color="blue">{{ campo.icone }}</v-icon>
                  {{ campo.titulo }}
                </strong>
                <div
                  :class="campo.isValor ? 'text-h6 font-weight-bold text-success' : 'text-body-1 font-weight-medium'"
                >
                  {{ campo.formatar ? campo.formatar(despesaSelecionada[campo.campo]) : despesaSelecionada[campo.campo] || '-' }}
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="8" v-if="despesaSelecionada?.observacoes">
              <v-card class="pa-4" outlined shaped>
                <strong class="text-blue text-subtitle-2 d-flex align-center mb-2 gap-2">
                  <v-icon size="20" color="blue">mdi-text-box-outline</v-icon>
                  Observações
                </strong>
                <div class="text-body-1 font-weight-medium">{{ despesaSelecionada.observacoes }}</div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />
        <v-card-actions class="justify-end px-6 pb-4">
          <v-btn color="primary" rounded @click="mostrarDetalhes = false" elevation="2">
            <v-icon start>mdi-close</v-icon> Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Confirmação -->
    <v-dialog v-model="modalConfirmacao.mostrar" max-width="480" transition="dialog-bottom-transition">
      <v-card class="pa-6" elevation="10" rounded>
        <v-card-title class="text-h6 font-weight-bold d-flex align-center gap-3">
          <v-icon color="red" size="36">mdi-alert-octagon</v-icon>
          Confirmar Exclusão
        </v-card-title>
        <v-card-text class="text-body-1 text-grey-darken-2">
          Tem certeza que deseja <strong>excluir</strong> esta despesa? Esta ação <u>não poderá ser desfeita</u>.
        </v-card-text>
        <v-card-actions class="justify-end mt-4 gap-4">
          <v-btn variant="outlined" color="grey" rounded @click="modalConfirmacao.mostrar = false" elevation="1">
            Cancelar
          </v-btn>
          <v-btn color="red lighten-1" rounded @click="confirmarExclusao" elevation="2">
            <v-icon start>mdi-trash-can</v-icon>
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.mostrar"
      :color="snackbar.cor"
      timeout="3500"
      multi-line
      vertical
      shaped
      class="ma-4"
    >
      {{ snackbar.mensagem }}
      <template #actions>
        <v-btn icon @click="snackbar.mostrar = false" color="white">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import axios from 'axios';
import FormDespesas from '@/components/FormDespesas.vue';
axios.defaults.withCredentials = true;

export default defineComponent({
  name: 'ListaDespesas',
  components: { FormDespesas },
  setup() {
    const despesas = ref<any[]>([]);
    const filtro = ref('');
    const mostrarForm = ref(false);
    const mostrarDetalhes = ref(false);
    const despesaSelecionada = ref<any>(null);

    const modalConfirmacao = ref({
      mostrar: false,
      idParaExcluir: null as number | null
    });

    const snackbar = ref({
      mostrar: false,
      mensagem: '',
      cor: 'success'
    });

    const headers = [
      { text: 'Descrição', value: 'descricao', sortable: true },
      { text: 'Valor', value: 'valor', sortable: true },
      { text: 'Tipo', value: 'tipo', sortable: true },
      { text: 'Data', value: 'dataDespesa', sortable: true },
      { text: 'Ações', value: 'actions', sortable: false }
    ];

    const detalhesCampos = [
      { titulo: 'Descrição', campo: 'descricao', icone: 'mdi-note-text-outline', isValor: false },
      { titulo: 'Valor', campo: 'valor', icone: 'mdi-currency-kzt', isValor: true, formatar: (v: number) => `Kz ${Number(v).toFixed(2)}` },
      { titulo: 'Tipo', campo: 'tipo', icone: 'mdi-shape-outline', isValor: false },
      { titulo: 'Data', campo: 'dataDespesa', icone: 'mdi-calendar', isValor: false, formatar: (d: string) => formatarData(d) },
    ];

    const carregarDespesas = async () => {
      try {
        const { data } = await axios.get('/despesas');
        despesas.value = data;
      } catch {
        mostrarSnackbar('Erro ao buscar despesas.', 'error');
      }
    };

    const abrirModalConfirmacao = (id: number) => {
      modalConfirmacao.value.mostrar = true;
      modalConfirmacao.value.idParaExcluir = id;
    };

    const confirmarExclusao = async () => {
      if (!modalConfirmacao.value.idParaExcluir) return;

      try {
        await axios.delete(`/despesas/${modalConfirmacao.value.idParaExcluir}`);
        despesas.value = despesas.value.filter((d) => d.id !== modalConfirmacao.value.idParaExcluir);
        mostrarSnackbar('Despesa excluída com sucesso.', 'success');
      } catch {
        mostrarSnackbar('Erro ao excluir despesa.', 'error');
      } finally {
        modalConfirmacao.value = { mostrar: false, idParaExcluir: null };
      }
    };

    const verDetalhes = (despesa: any) => {
      despesaSelecionada.value = despesa;
      mostrarDetalhes.value = true;
    };

    const aoCadastrarDespesa = () => {
      mostrarForm.value = false;
      carregarDespesas();
      mostrarSnackbar('Despesa cadastrada com sucesso!', 'success');
    };

    const formatarData = (data: string) => {
      return new Date(data).toLocaleDateString('pt-BR');
    };

    const mostrarSnackbar = (mensagem: string, cor: string) => {
      snackbar.value = { mostrar: true, mensagem, cor };
    };

    const despesasFiltradas = computed(() => {
      if (!filtro.value) return despesas.value;
      return despesas.value.filter((d) =>
        d.descricao.toLowerCase().includes(filtro.value.toLowerCase())
      );
    });

    onMounted(carregarDespesas);

    return {
      despesas,
      filtro,
      despesasFiltradas,
      headers,
      mostrarForm,
      mostrarDetalhes,
      despesaSelecionada,
      modalConfirmacao,
      abrirModalConfirmacao,
      confirmarExclusao,
      verDetalhes,
      aoCadastrarDespesa,
      formatarData,
      mostrarSnackbar,
      snackbar,
      detalhesCampos,
    };
  }
});
</script>

<style scoped>
.gap-3 {
  gap: 1rem;
}

.text-none {
  text-transform: none !important;
}

.v-data-table > .v-data-table__wrapper {
  font-family: 'Roboto', sans-serif;
}

.v-data-table-header th {
  background-color: #e3f2fd;
  color: #0d47a1;
  font-weight: 600;
}

.v-data-table-footer {
  font-weight: 600;
  font-size: 0.9rem;
}

.v-card-title > div span {
  font-size: 1.5rem;
  letter-spacing: 0.05rem;
}

.v-chip {
  font-weight: 700;
  font-size: 0.9rem;
}
</style>
