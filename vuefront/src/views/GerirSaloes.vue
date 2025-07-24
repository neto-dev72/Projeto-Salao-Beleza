<template>
  <v-container class="py-8">
    <!-- Botão Novo Salão estilizado -->
    <v-row justify="center" class="mb-8">
      <v-btn
        color="deep-purple accent-4"
        class="white--text font-weight-bold"
        @click="abrirModal = true"
        rounded
        elevation="6"
        height="48"
        width="180"
        style="text-transform: none;"
        hover
      >
        <v-icon left>mdi-plus-circle-outline</v-icon>
        Novo Salão
      </v-btn>
    </v-row>

    <!-- Modal para cadastro de salão -->
    <v-dialog v-model="abrirModal" max-width="700">
      <FormSaloes @close="abrirModal = false" @salonCreated="onSalonCreated" />
    </v-dialog>

    <!-- Mensagem caso lista vazia -->
    <v-row justify="center" v-if="listaSaloes.length === 0">
      <v-col cols="12" md="6" class="text-center">
        <v-sheet color="grey lighten-4" class="pa-6" elevation="1" rounded>
          <v-icon size="48" color="grey">mdi-office-building</v-icon>
          <div class="subtitle-1 mt-4">Nenhum salão cadastrado ainda.</div>
          <div class="body-2 grey--text mt-2">
            Clique em "Novo Salão" para começar a cadastrar.
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- Lista de salões com cards -->
    <v-row v-else dense>
      <v-col
        v-for="salon in listaSaloes"
        :key="salon.id"
        cols="12"
        md="6"
        lg="4"
        class="d-flex"
      >
        <v-card
          elevation="4"
          class="flex-grow-1"
          outlined
          hover
          style="transition: transform 0.3s ease; position: relative;"
          @mouseenter="$el.style.transform = 'scale(1.03)'"
          @mouseleave="$el.style.transform = 'scale(1)'"
        >
          <!-- Botão Excluir -->
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                color="red darken-2"
                v-bind="attrs"
                v-on="on"
                style="position: absolute; top: 8px; right: 8px;"
                @click="confirmarExclusao(salon)"
                title="Excluir salão"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Excluir salão</span>
          </v-tooltip>

          <v-card-title class="font-weight-bold deep-purple--text text--darken-4">
            {{ salon.nome }}
          </v-card-title>

          <v-card-subtitle class="grey--text text--darken-1">
            {{ salon.endereco }}<br />
            <v-icon small class="mr-1">mdi-phone</v-icon> {{ salon.telefone }}
          </v-card-subtitle>

          <v-divider class="my-2"></v-divider>

          <v-card-text>
            <!-- Status com chips e toggle escondido -->
            <div class="mb-4 d-flex align-center justify-space-between">
              <div>
                <v-chip
                  :color="statusColor(salon.status)"
                  dark
                  small
                  class="font-weight-medium text-capitalize"
                >
                  {{ salon.status }}
                </v-chip>
              </div>

              <v-btn-toggle
                :model-value="salon.status"
                @update:modelValue="novoStatus => atualizarStatusSalao(salon, novoStatus)"
                dense
                mandatory
                rounded
                class="status-toggle"
              >
                <v-btn
                  value="pendente"
                  :color="salon.status === 'pendente' ? 'grey lighten-1' : 'grey lighten-4'"
                  depressed
                  rounded
                  title="Status Pendente"
                >
                  Pendente
                </v-btn>
                <v-btn
                  value="ativo"
                  :color="salon.status === 'ativo' ? 'deep-purple accent-4' : 'grey lighten-4'"
                  depressed
                  rounded
                  class="white--text"
                  title="Status Ativo"
                >
                  Ativo
                </v-btn>
                <v-btn
                  value="bloqueado"
                  :color="salon.status === 'bloqueado' ? 'red darken-2' : 'grey lighten-4'"
                  depressed
                  rounded
                  class="white--text"
                  title="Status Bloqueado"
                >
                  Bloqueado
                </v-btn>
              </v-btn-toggle>
            </div>

            <v-divider></v-divider>

            <!-- Botão para gerenciar usuários -->
            <div class="mt-3 d-flex justify-end">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    color="deep-purple accent-4"
                    v-bind="attrs"
                    v-on="on"
                    @click="abrirUsuariosModal(salon.id)"
                    title="Gerenciar usuários"
                  >
                    <v-icon size="28">mdi-account-group</v-icon>
                  </v-btn>
                </template>
                <span>Gerenciar usuários</span>
              </v-tooltip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo de confirmação da exclusão -->
    <v-dialog v-model="dialogExcluir" max-width="400">
      <v-card>
        <v-card-title class="headline">
          Confirmar Exclusão
        </v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir o salão
          <strong>{{ salãoParaExcluir?.nome }}</strong>?
          Esta ação não pode ser desfeita.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogExcluir = false">Cancelar</v-btn>
          <v-btn color="red darken-2" text @click="excluirSalao">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de gerenciamento de usuários do salão -->
    <UsuariosSalaoModal
      v-if="idSalaoSelecionado !== null"
      :salonId="idSalaoSelecionado"
      :mostrarModal="mostrarUsuariosModal"
      @update:mostrarModal="mostrarUsuariosModal = $event"
    />
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import axios from "axios";
import FormSaloes from "@/components/FormSaloes.vue";
import UsuariosSalaoModal from "@/components/UsuarioSalaoModal.vue";

export default defineComponent({
  name: "GerirSalao",
  components: {
    FormSaloes,
    UsuariosSalaoModal,
  },
  setup() {
    const abrirModal = ref(false);
    const listaSaloes = ref<any[]>([]);
    const mostrarUsuariosModal = ref(false);
    const idSalaoSelecionado = ref<number | null>(null);

    // Estado para exclusão
    const dialogExcluir = ref(false);
    const salãoParaExcluir = ref<any | null>(null);

    const abrirUsuariosModal = (salaoId: number) => {
      idSalaoSelecionado.value = salaoId;
      mostrarUsuariosModal.value = true;
    };

    const fetchSaloes = async () => {
      try {
        const { data } = await axios.get("/todos-saloes");
        listaSaloes.value = data.saloes || [];
      } catch (e) {
        console.error("Erro ao buscar salões:", e);
      }
    };

    const atualizarStatusSalao = async (salon: any, novoStatus: string) => {
      try {
        await axios.put(`/saloes/${salon.id}/status`, {
          status: novoStatus,
        });
        salon.status = novoStatus;
      } catch (err) {
        console.error("Erro ao atualizar status do salão:", err);
      }
    };

    // Função para abrir diálogo de confirmação
    const confirmarExclusao = (salon: any) => {
      salãoParaExcluir.value = salon;
      dialogExcluir.value = true;
    };

    // Função para excluir salão
    const excluirSalao = async () => {
      if (!salãoParaExcluir.value) return;

      try {
        await axios.delete(`/saloes/${salãoParaExcluir.value.id}`);
        listaSaloes.value = listaSaloes.value.filter(
          (s) => s.id !== salãoParaExcluir.value.id
        );
        dialogExcluir.value = false;
        salãoParaExcluir.value = null;
      } catch (err) {
        console.error("Erro ao excluir salão:", err);
      }
    };

    const onSalonCreated = (novoSalon: any) => {
      listaSaloes.value.push(novoSalon);
    };

    onMounted(() => {
      fetchSaloes();
    });

    const statusColor = (status: string) => {
      switch (status) {
        case "ativo":
          return "deep-purple accent-4";
        case "pendente":
          return "grey";
        case "bloqueado":
          return "red darken-2";
        default:
          return "grey";
      }
    };

    return {
      abrirModal,
      listaSaloes,
      onSalonCreated,
      mostrarUsuariosModal,
      idSalaoSelecionado,
      abrirUsuariosModal,
      atualizarStatusSalao,
      statusColor,

      dialogExcluir,
      salãoParaExcluir,
      confirmarExclusao,
      excluirSalao,
    };
  },
});
</script>

<style scoped>
.status-toggle .v-btn {
  text-transform: capitalize;
  min-width: 75px;
  padding-left: 10px !important;
  padding-right: 10px !important;
  font-weight: 500;
}

/* Ajuste para cartões na listagem */
.v-card {
  cursor: pointer;
}

/* Pequeno efeito hover para o botão novo salão */
.v-btn:hover {
  filter: brightness(1.1);
  transition: filter 0.2s ease;
}
</style>
