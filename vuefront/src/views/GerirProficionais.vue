<template>
  <v-container class="py-10">
    <!-- Hero Image -->
    <div class="hero-bg">
      <v-container class="d-flex justify-center align-center" style="height: 200px;">
        <v-row class="fill-height">
          <v-col cols="12" md="6" class="text-center px-6">
            <v-img
              src="@/assets/img/atender.jpg"
              alt="Imagem de funcionários"
              class="rounded-lg elevation-14 image-primary"
              lazy-src="@/assets/img/home-img2.jpg"
              cover
            />
          </v-col>
          <v-col cols="12" md="6" class="text-center text-md-left px-12">
            <h1 class="display-2 font-weight-bold mb-6 hero-title">
              Gerenciamento de <span class="highlight">Funcionários</span>
            </h1>
            <p class="subtitle-1 mb-8 hero-subtitle">
              Organize e acompanhe a performance de seus funcionários.
            </p>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Lista de Funcionários -->
    <v-card elevation="4" class="pa-4 mt-8">
      <v-card-title class="text-h5 d-flex justify-space-between align-center">
        <span>👥 Lista de Funcionários</span>
        <v-btn color="primary" @click="mostrarForm = true" prepend-icon="mdi-account-plus">
          Novo Funcionário
        </v-btn>
      </v-card-title>

      <v-text-field
        v-model="filtro"
        label="Buscar por nome, função ou email"
        prepend-inner-icon="mdi-magnify"
        class="mb-4"
        clearable
      />

      <v-data-table
        :headers="headers"
        :items="funcionariosFiltrados"
        :items-per-page="10"
        class="elevation-1"
      >
        <template #item.actions="{ item }">
          <v-btn color="info" @click="verHistorico(item)" size="small" icon class="mr-2" title="Ver histórico">
            <v-icon>mdi-file-document-outline</v-icon>
          </v-btn>
          <v-btn color="error" @click="excluirFuncionario(item.id)" size="small" icon title="Excluir funcionário">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal de Cadastro -->
    <v-dialog v-model="mostrarForm" max-width="800">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>📝 Cadastro de Funcionário</span>
          <v-btn icon color="red" @click="mostrarForm = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <FormFuncionario @salvo="aoCadastrarFuncionario" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Modal Histórico -->
    <HistoricoFuncionario
      :mostrar="mostrarHistorico"
      :funcionario="funcionarioSelecionado"
      :historico="historico"
      :totalGanho="totalGanho"
      :servicoMaisRealizado="servicoMaisRealizado"
      :rankingServicos="rankingServicos"
      :kzGanho="kzGanho"
      @fechar="mostrarHistorico = false"
    />
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import axios from 'axios'
import FormFuncionario from '@/components/FormFuncionario.vue'
import HistoricoFuncionario from '@/components/HistoricoFuncionario.vue'

axios.defaults.withCredentials = true

interface Funcionario {
  id: number
  nome: string
  funcao: string
  email: string
  ativo: boolean
  dataEntrada: string
}

export default defineComponent({
  name: 'GerirFuncionarios',
  components: { FormFuncionario, HistoricoFuncionario },
  setup() {
    const funcionarios = ref<Funcionario[]>([])
    const filtro = ref('')
    const mostrarForm = ref(false)
    const mostrarHistorico = ref(false)
    const funcionarioSelecionado = ref<Funcionario | null>(null)
    const historico = ref<any[]>([])
    const totalGanho = ref(0)
    const servicoMaisRealizado = ref('')
    const rankingServicos = ref<any[]>([]) // Novo: array com { nome, quantidade }
    const kzGanho = ref<number | null>(null)

    const headers = [
      { text: 'Nome', value: 'nome' },
      { text: 'Função', value: 'funcao' },
      { text: 'Email', value: 'email' },
      { text: 'Status', value: 'ativo', sortable: false },
      { text: 'Ações', value: 'actions', sortable: false }
    ]

    const carregarFuncionarios = async () => {
      try {
        const { data } = await axios.get('/funcionarios')
        funcionarios.value = data
      } catch (e) {
        console.error(e)
        alert('Erro ao buscar funcionários.')
      }
    }

    const verHistorico = async (funcionario: Funcionario) => {
      try {
        const { data } = await axios.get(`/funcionarios/${funcionario.id}/historico`)
        historico.value = data.historico
        totalGanho.value = data.totalGanho
        servicoMaisRealizado.value = data.servicoMaisRealizado
        rankingServicos.value = data.rankingServicos || []
        kzGanho.value = data.kzGanho || null
        funcionarioSelecionado.value = funcionario
        mostrarHistorico.value = true
      } catch (e) {
        console.error(e)
        alert('Erro ao buscar histórico.')
      }
    }

    const excluirFuncionario = async (id: number) => {
      if (!confirm('Deseja realmente excluir este funcionário?')) return
      try {
        await axios.delete(`/funcionarios/${id}`)
        funcionarios.value = funcionarios.value.filter(f => f.id !== id)
        alert('Funcionário excluído.')
      } catch (e) {
        console.error(e)
        alert('Erro ao excluir funcionário.')
      }
    }

    const aoCadastrarFuncionario = () => {
      mostrarForm.value = false
      carregarFuncionarios()
    }

    const funcionariosFiltrados = computed(() =>
      funcionarios.value.filter(f =>
        [f.nome, f.funcao, f.email].some(field =>
          field?.toLowerCase().includes(filtro.value.toLowerCase())
        )
      )
    )

    onMounted(() => {
      carregarFuncionarios()
    })

    return {
      filtro,
      mostrarForm,
      mostrarHistorico,
      funcionarioSelecionado,
      historico,
      totalGanho,
      servicoMaisRealizado,
      rankingServicos,
      kzGanho,
      headers,
      verHistorico,
      excluirFuncionario,
      aoCadastrarFuncionario,
      funcionariosFiltrados,
      carregarFuncionarios
    }
  }
})
</script>

<style scoped>
.hero-bg {
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%);
  box-shadow: inset 0 0 40px rgba(255, 192, 203, 0.25);
  width: 100%;
  min-height: 40vh;
  display: flex;
  align-items: center;
}

.image-primary {
  width: 100%;
  height: 350px;
  object-fit: cover;
  box-shadow: 0 20px 40px rgba(220, 90, 140, 0.5);
  transition: transform 0.3s ease;
  border-radius: 20px !important;
}

.image-primary:hover {
  transform: scale(1.05) translateY(-10px);
}

.hero-title {
  font-weight: 900;
  line-height: 1.2;
  color: #880e4f;
}

.highlight {
  color: #d81b60;
}

.hero-subtitle {
  color: #4a148c;
}

.v-btn {
  margin-top: 0 !important;
}
</style>
