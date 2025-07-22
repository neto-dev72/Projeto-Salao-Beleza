<template>
  <v-dialog v-model="mostrar" max-width="700" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Usuários do Salão</span>
        <v-btn icon @click="fecharModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-alert v-if="usuarios.length === 0" type="info" class="mb-4">
          Nenhum usuário encontrado neste salão.
        </v-alert>

        <v-list v-else>
          <v-list-item
            v-for="usuario in usuarios"
            :key="usuario.id"
            class="border mb-2 rounded"
          >
            <v-list-item-content>
              <v-list-item-title>{{ usuario.nome }}</v-list-item-title>
              <v-list-item-subtitle>{{ usuario.email }}</v-list-item-subtitle>
            </v-list-item-content>

            <!-- Botões de função responsivos -->
            <v-list-item-action style="min-width: 300px;">
              <v-btn-toggle
                :model-value="usuario.funcao"
                @update:modelValue="(novaFuncao) => atualizarFuncao(usuario, novaFuncao)"
                dense
                mandatory
                style="display: flex; flex-wrap: wrap; gap: 6px; width: 100%;"
              >
                <v-btn
                  v-for="funcao in funcoes"
                  :key="funcao"
                  :value="funcao"
                  :color="usuario.funcao === funcao ? 'primary' : 'grey lighten-4'"
                  depressed
                  rounded
                  style="text-transform: capitalize; min-width: 120px;"
                >
                  {{ funcao.replace('_', ' ') }}
                </v-btn>
              </v-btn-toggle>
            </v-list-item-action>

            <!-- Switch de status ativo -->
            <v-list-item-action>
              <v-switch
                v-model="usuario.ativo"
                @change="() => atualizarStatus(usuario)"
                color="green"
                inset
              />
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text color="primary" @click="fecharModal">Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import axios from 'axios'

export default defineComponent({
  name: 'UsuariosSalaoModal',
  props: {
    salonId: { type: Number, required: true },
    mostrarModal: { type: Boolean, required: true }
  },
  emits: ['update:mostrarModal'],
  setup(props, { emit }) {
    const mostrar = ref(props.mostrarModal)
    const usuarios = ref<any[]>([])

    const funcoes = ['super_admin', 'admin', 'recepcionista', 'profissional']

    watch(
      () => props.mostrarModal,
      (val) => {
        mostrar.value = val
        if (val) buscarUsuarios()
      }
    )

    watch(mostrar, (val) => emit('update:mostrarModal', val))

    const buscarUsuarios = async () => {
      try {
        const token = localStorage.getItem('token')
        const { data } = await axios.get(`/salao/${props.salonId}/usuarios`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        usuarios.value = data.usuarios || []
      } catch (err) {
        console.error('Erro ao buscar usuários:', err)
      }
    }

    const atualizarFuncao = async (usuario: any, novaFuncao: string) => {
      try {
        const token = localStorage.getItem('token')
        await axios.put(
          `/${usuario.id}/funcao`,
          { funcao: novaFuncao },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        )
        usuario.funcao = novaFuncao
      } catch (err) {
        console.error('Erro ao atualizar função:', err)
      }
    }

    const atualizarStatus = async (usuario: any) => {
      try {
        const token = localStorage.getItem('token')
        await axios.put(
          `/${usuario.id}/status`,
          { ativo: usuario.ativo },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        )
      } catch (err) {
        console.error('Erro ao atualizar status:', err)
      }
    }

    const fecharModal = () => {
      mostrar.value = false
    }

    return {
      mostrar,
      usuarios,
      funcoes,
      atualizarFuncao,
      atualizarStatus,
      fecharModal
    }
  }
})
</script>

<style scoped>
.border {
  border: 1px solid #ccc;
}
</style>
