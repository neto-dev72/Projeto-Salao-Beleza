<template>
  <v-container class="py-10">
    <!-- Hero Image (Background) -->
    <div class="hero-bg">
      <v-container class="d-flex justify-center align-center" style="height: 200px;">
        <v-row class="fill-height">
          <v-col cols="12" md="6" class="text-center px-6">
            <v-img
              src="@/assets/img/atender.jpg"
              alt="Imagem salão de beleza"
              class="rounded-lg elevation-14 image-primary"
              lazy-src="@/assets/img/home-img2.jpg"
              cover
            ></v-img>
          </v-col>
          <v-col cols="12" md="6" class="text-center text-md-left px-12">
            <h1 class="display-2 font-weight-bold mb-6 hero-title">
              Cuidando do atendimento aos <span class="highlight">seus</span> clientes
            </h1>
            <p class="subtitle-1 mb-8 hero-subtitle">
              Gerencie suas interações com eficiência e empatia.
            </p>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Lista de Clientes -->
    <v-card elevation="4" class="pa-4 mt-8">
      <v-card-title class="text-h5 d-flex justify-space-between align-center">
        <span>👥 Lista de Clientes</span>
        <v-btn color="primary" @click="mostrarForm = true" prepend-icon="mdi-account-plus">
          Novo Cliente
        </v-btn>
      </v-card-title>

      <v-text-field
        v-model="filtro"
        label="Buscar por nome, telefone ou email"
        prepend-inner-icon="mdi-magnify"
        class="mb-4"
        clearable
      />

      <v-data-table
        :headers="headers"
        :items="clientesFiltrados"
        :items-per-page="10"
        class="elevation-1"
      >
        <template #item.actions="{ item }">
          <v-btn color="info" @click="verHistorico(item)" size="small" icon class="mr-2" title="Ver histórico">
            <v-icon>mdi-file-document-outline</v-icon>
          </v-btn>

          <v-btn color="success" @click="atenderCliente(item)" size="small" class="mr-2" title="Atender cliente" outlined>
            <v-icon left>mdi-account-arrow-right</v-icon> Atender
          </v-btn>

          <v-btn color="error" @click="excluirCliente(item.id)" size="small" icon title="Excluir cliente">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal de Cadastro -->
    <v-dialog v-model="mostrarForm" max-width="800">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>📝 Cadastro de Cliente</span>
          <v-btn icon color="red" @click="mostrarForm = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <FormCli @salvo="aoCadastrarCliente" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Modal Historico -->
    <HistoricoCliente
      :mostrar="mostrarHistorico"
      :cliente="clienteSelecionado"
      :historico="historico"
      :total-gasto="totalGasto"
      :servico-mais-comprado="servicoMaisComprado"
      :produto-mais-comprado="produtoMaisComprado"
      @fechar="mostrarHistorico = false"
    />

    <!-- Modal Atendimento (CORRIGIDO) -->
    <Atendimento
      v-model="mostrarAtendimento"
      :cliente="clienteSelecionado"
      @finalizado="carregarClientes"
    />
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import axios from 'axios'
import FormCli from '@/components/FormCliente.vue'
import HistoricoCliente from '@/components/HistoricoCliente.vue'
import Atendimento from '@/components/Atendimento.vue'

axios.defaults.withCredentials = true

interface Cliente {
  id: number
  nome: string
  telefone: string
  email: string
  localidade?: string
  dataNascimento?: string
  observacoes?: string
}

export default defineComponent({
  name: 'GerirClientes',
  components: { FormCli, HistoricoCliente, Atendimento },
  setup() {
    const clientes = ref<Cliente[]>([])
    const filtro = ref('')
    const mostrarForm = ref(false)
    const mostrarHistorico = ref(false)
    const mostrarAtendimento = ref(false)
    const clienteSelecionado = ref<Cliente | null>(null)
    const historico = ref<any[]>([])
    const totalGasto = ref(0)
    const servicoMaisComprado = ref('')
    const produtoMaisComprado = ref('')

    const headers = [
      { text: 'Nome', value: 'nome' },
      { text: 'Telefone', value: 'telefone' },
      { text: 'Email', value: 'email' },
      { text: 'Localidade', value: 'localidade' },
      { text: 'Ações', value: 'actions', sortable: false }
    ]

    const carregarClientes = async () => {
      try {
        const { data } = await axios.get('/clientes')
        clientes.value = data
      } catch (e) {
        console.error(e)
        alert('Erro ao buscar clientes.')
      }
    }

    const verHistorico = async (cliente: Cliente) => {
      try {
        const { data } = await axios.get(`/clientes/${cliente.id}/historico`)
        historico.value = data.historico
        totalGasto.value = data.totalGasto
        servicoMaisComprado.value = data.servicoMaisComprado
        produtoMaisComprado.value = data.produtoMaisComprado
        clienteSelecionado.value = cliente
        mostrarHistorico.value = true
      } catch (e) {
        console.error(e)
        alert('Erro ao buscar histórico.')
      }
    }

    const excluirCliente = async (id: number) => {
      if (!confirm('Deseja realmente excluir este cliente?')) return
      try {
        await axios.delete(`/clientes/${id}`)
        clientes.value = clientes.value.filter(c => c.id !== id)
        alert('Cliente excluído.')
      } catch (e) {
        console.error(e)
        alert('Erro ao excluir cliente.')
      }
    }

    const aoCadastrarCliente = () => {
      mostrarForm.value = false
      carregarClientes()
    }

    const atenderCliente = (cliente: Cliente) => {
      clienteSelecionado.value = cliente
      mostrarAtendimento.value = true
    }

    const clientesFiltrados = computed(() =>
      clientes.value.filter(c =>
        [c.nome, c.telefone, c.email].some(field =>
          field?.toLowerCase().includes(filtro.value.toLowerCase())
        )
      )
    )

    onMounted(() => {
      carregarClientes()
    })

    return {
      filtro,
      mostrarForm,
      mostrarHistorico,
      mostrarAtendimento,
      clienteSelecionado,
      historico,
      totalGasto,
      servicoMaisComprado,
      produtoMaisComprado,
      headers,
      verHistorico,
      excluirCliente,
      aoCadastrarCliente,
      atenderCliente,
      clientesFiltrados,
      carregarClientes
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

.hero-section {
  min-height: 40vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 0;
  padding-bottom: 0;
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
