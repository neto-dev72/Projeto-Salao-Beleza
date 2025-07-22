<template>
  <v-container class="py-8">
    <!-- Botão para novo salão -->
    <v-btn color="primary" @click="abrirModal = true" class="mb-6" rounded>
      <v-icon left>mdi-plus</v-icon>
      Novo Salão
    </v-btn>

    <!-- Modal para cadastro de salão -->
    <v-dialog v-model="abrirModal" max-width="700">
      <FormSaloes @close="abrirModal = false" @salonCreated="onSalonCreated" />
    </v-dialog>

    <!-- Lista de salões -->
    <div v-if="listaSaloes.length === 0">Nenhum salão cadastrado ainda.</div>

    <v-list v-else>
      <v-list-item
        v-for="salon in listaSaloes"
        :key="salon.id"
        class="border rounded mb-3"
      >
        <v-list-item-content>
          <v-list-item-title>{{ salon.nome }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ salon.endereco }} | {{ salon.telefone }}
          </v-list-item-subtitle>
        </v-list-item-content>

        <!-- Botões de status -->
        <v-list-item-action>
          <v-btn-toggle
            :model-value="salon.status"
            @update:modelValue="(novoStatus) => atualizarStatusSalao(salon, novoStatus)"
            dense
            mandatory
            style="width: 240px"
          >
            <v-btn
              value="pendente"
              :color="salon.status === 'pendente' ? 'grey lighten-1' : 'grey lighten-4'"
              depressed
              rounded
              style="text-transform: capitalize; min-width: 80px; padding-left: 12px; padding-right: 12px;"
            >
              Pendente
            </v-btn>
            <v-btn
              value="ativo"
              :color="salon.status === 'ativo' ? 'primary' : 'grey lighten-4'"
              depressed
              rounded
              style="text-transform: capitalize; min-width: 80px; padding-left: 12px; padding-right: 12px;"
            >
              Ativo
            </v-btn>
            <v-btn
              value="bloqueado"
              :color="salon.status === 'bloqueado' ? 'error' : 'grey lighten-4'"
              :style="{
                color: salon.status === 'bloqueado' ? 'white' : 'black',
                textTransform: 'capitalize',
                minWidth: '90px',
                paddingLeft: '12px',
                paddingRight: '12px'
              }"
              depressed
              rounded
            >
              Bloqueado
            </v-btn>
          </v-btn-toggle>
        </v-list-item-action>

        <!-- Botão de usuários -->
        <v-list-item-action>
          <v-btn
            icon
            @click="abrirUsuariosModal(salon.id)"
            title="Gerenciar usuários"
          >
            <v-icon color="primary">mdi-account-group</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>

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
        console.log("Atualizando status do salão:", salon.id, "para:", novoStatus);
        await axios.put(`/saloes/${salon.id}/status`, {
          status: novoStatus,
        });
        salon.status = novoStatus;
      } catch (err) {
        console.error("Erro ao atualizar status do salão:", err);
      }
    };

    const onSalonCreated = (novoSalon: any) => {
      listaSaloes.value.push(novoSalon);
    };

    onMounted(() => {
      fetchSaloes();
    });

    return {
      abrirModal,
      listaSaloes,
      onSalonCreated,
      mostrarUsuariosModal,
      idSalaoSelecionado,
      abrirUsuariosModal,
      atualizarStatusSalao,
    };
  },
});
</script>

<style scoped>
.border {
  border: 1px solid #ddd;
}
</style>
