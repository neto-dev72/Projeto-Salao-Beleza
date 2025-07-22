<template>
  <v-container class="py-10" fluid style="background: linear-gradient(to right, #fce4ec, #f8bbd0); min-height: 100vh;">
    <!-- Hero Image (Background) -->
    <div class="hero-bg" style="position: relative; height: 400px;">
      <v-container class="d-flex justify-center align-center" style="height: 100%;">
        <v-row class="fill-height">
          <v-col cols="12" md="6" class="text-center px-6">
            <v-img
              src="@/assets/img/atender.jpg"
              alt="Imagem gestão de usuários"
              class="rounded-lg elevation-14 image-primary"
              lazy-src="@/assets/img/home-img2.jpg"
              cover
            ></v-img>
          </v-col>
          <v-col cols="12" md="6" class="text-center text-md-left px-12">
            <h1 class="display-2 font-weight-bold mb-6 hero-title">
              Gerenciamento de <span class="highlight">Usuários</span>
            </h1>
            <p class="subtitle-1 mb-8 hero-subtitle">
              Organize e gerencie seus usuários com facilidade e segurança.
            </p>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Cartão de Gerenciamento de Usuários -->
    <v-card
      class="mx-auto pa-6 rounded-xl elevation-12"
      max-width="1100px"
      style="background-color: white; position: relative; margin-top: -100px; z-index: 10;"
    >
      <v-card-title class="text-h4 font-weight-bold mb-6 text-primary d-flex align-center justify-center">
        <v-icon size="36" class="me-3" color="primary">mdi-account-group</v-icon>
        Gerenciamento de Usuários

        <!-- Botão para admin abrir modal -->
        <v-spacer></v-spacer>
        <v-btn
          v-if="usuarioAtual?.funcao === 'admin'"
          color="primary"
          @click="abrirModalCadastro"
        >
          Cadastrar Usuário
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="usuarios"
        class="elevation-4 rounded-lg"
        item-value="id"
        dense
        items-per-page="8"
        hide-default-footer
      >
        <template #item.funcao="{ item }">
          <v-select
            :items="funcoes"
            v-model="item.funcao"
            @update:modelValue="() => atualizarFuncao(item)"
            density="compact"
            variant="outlined"
            class="w-100"
            style="max-width: 160px"
            hide-details
          />
        </template>

        <template #item.ativo="{ item }">
          <v-chip
            :color="item.ativo ? 'green' : 'red'"
            class="text-white font-weight-medium"
            size="small"
            label
          >
            {{ item.ativo ? 'Ativo' : 'Inativo' }}
          </v-chip>
          <v-switch
            v-model="item.ativo"
            @change="() => atualizarStatus(item)"
            inset
            hide-details
            color="green"
            density="compact"
          />
        </template>

        <template #item.createdAt="{ item }">
          <v-icon icon="mdi-calendar" size="18" class="me-1" color="primary" />
          {{ formatarData(item.createdAt) }}
        </template>

        <template #item.acoes="{ item }">
          <v-tooltip text="Excluir usuário">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                color="red"
                variant="text"
                @click="excluirUsuario(item.id)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal do formulário de cadastro para admin -->
    <v-dialog v-model="modalCadastro" max-width="500">
      <v-card>
        <v-card-title>
          <span class="text-h6">Cadastrar Usuário</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="formCadastro" @submit.prevent="cadastrarUsuarioAdmin">
            <v-text-field label="Nome" v-model="novoUsuario.nome" required />
            <v-text-field label="Email" v-model="novoUsuario.email" type="email" required />
            <v-text-field
              label="Senha"
              v-model="novoUsuario.senha"
              :type="mostrarSenha ? 'text' : 'password'"
              required
            >
              <template #append-inner>
                <v-icon @click="mostrarSenha = !mostrarSenha" class="cursor-pointer">
                  {{ mostrarSenha ? 'mdi-eye-off' : 'mdi-eye' }}
                </v-icon>
              </template>
            </v-text-field>

            <v-select
              label="Função"
              v-model="novoUsuario.funcao"
              :items="funcoesPermitidasParaAdmin"
              required
            />

            <v-btn type="submit" color="primary" class="mt-4" block>
              Cadastrar
            </v-btn>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="secondary" @click="fecharModalCadastro">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const usuarios = ref<any[]>([])
const funcoes = ['admin', 'recepcionista', 'profissional']
const funcoesPermitidasParaAdmin = ['recepcionista', 'profissional']

const token = localStorage.getItem('token')

const headers = [
  { title: 'Nome', key: 'nome', align: 'start' },
  { title: 'Email', key: 'email' },
  { title: 'Função', key: 'funcao' },
  { title: 'Status', key: 'ativo' },
  { title: 'Cadastro', key: 'createdAt' },
  { title: 'Ações', key: 'acoes', sortable: false }
]

const usuarioAtual = ref<any>(null)
const modalCadastro = ref(false)
const mostrarSenha = ref(false)

const novoUsuario = ref({
  nome: '',
  email: '',
  senha: '',
  funcao: ''
})

async function carregarUsuarios() {
  try {
    const res = await axios.get('/gerir-usuarios', {
      headers: { Authorization: `Bearer ${token}` },
    })
    usuarios.value = res.data.map((u: any) => ({
      ...u,
      ativo: Boolean(u.ativo),
    }))
  } catch (err) {
    console.error('Erro ao carregar usuários:', err)
    toast.error('Erro ao carregar usuários')
  }
}

async function carregarUsuarioAtual() {
  try {
    const res = await axios.get('/usuarios/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    usuarioAtual.value = res.data.usuario
  } catch (err) {
    console.error('Erro ao carregar usuário atual:', err)
  }
}

function abrirModalCadastro() {
  modalCadastro.value = true
}

function fecharModalCadastro() {
  modalCadastro.value = false
  novoUsuario.value = { nome: '', email: '', senha: '', funcao: '' }
  mostrarSenha.value = false
}

async function cadastrarUsuarioAdmin() {
  try {
    if (!novoUsuario.value.nome || !novoUsuario.value.email || !novoUsuario.value.senha || !novoUsuario.value.funcao) {
      toast.error('Preencha todos os campos')
      return
    }

    const res = await axios.post('/usuarios/cadastrar-por-admin', novoUsuario.value, {
      headers: { Authorization: `Bearer ${token}` }
    })

    toast.success('Usuário cadastrado com sucesso')
    fecharModalCadastro()
    carregarUsuarios()
  } catch (err: any) {
    console.error('Erro ao cadastrar usuário:', err)
    toast.error(err.response?.data?.erro || 'Erro ao cadastrar usuário')
  }
}

async function atualizarFuncao(usuario: any) {
  try {
    await axios.put(
      `/usuarios/${usuario.id}/funcao`,
      { funcao: usuario.funcao },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    toast.success('Função atualizada com sucesso')
  } catch (err) {
    console.error('Erro ao atualizar função:', err)
    toast.error('Erro ao atualizar função')
  }
}

async function atualizarStatus(usuario: any) {
  try {
    await axios.put(
      `/usuarios/${usuario.id}/status`,
      { ativo: usuario.ativo },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    toast.success('Status atualizado com sucesso')
  } catch (err) {
    console.error('Erro ao atualizar status:', err)
    toast.error('Erro ao atualizar status')
  }
}

async function excluirUsuario(usuarioId: any) {
  try {
    await axios.delete(`/usuarios/${usuarioId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('Usuário excluído com sucesso')
    carregarUsuarios()
  } catch (err) {
    console.error('Erro ao excluir usuário:', err)
    toast.error('Erro ao excluir usuário')
  }
}

function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// Carregar usuários ao montar
onMounted(() => {
  carregarUsuarios()
  carregarUsuarioAtual()
})
</script>

<style scoped>
.hero-bg {
  background-color: #f8bbd0;
  background-size: cover;
  background-position: center;
}

.hero-title {
  font-size: 3rem;
  color: #fff;
  font-weight: bold;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #fff;
}

.highlight {
  color: #f50057;
}

.v-data-table .v-chip {
  font-size: 0.875rem;
  padding: 5px 10px;
}
</style>
