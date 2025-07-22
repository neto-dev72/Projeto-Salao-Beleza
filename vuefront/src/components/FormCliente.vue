<template>
  <v-card elevation="8" class="pa-6 mx-auto mt-10 animate__animated animate__fadeIn" max-width="600">
    <v-card-title class="text-h4 font-weight-bold mb-2">
      <v-icon color="primary" class="mr-2">mdi-account-plus</v-icon>
      Cadastro de Cliente
    </v-card-title>
    <v-divider class="mb-6" />

    <v-card-text>
      <v-form ref="form" validate-on="submit lazy">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
              label="Nome completo"
              v-model="cliente.nome"
              prepend-inner-icon="mdi-account"
              clearable
              required
              :class="{ 'focus-blue': focusedField === 'nome' }"
              @focus="focusedField = 'nome'"
              @blur="focusedField = ''"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              label="Telefone"
              v-model="cliente.telefone"
              prepend-inner-icon="mdi-phone"
              clearable
              :class="{ 'focus-blue': focusedField === 'telefone' }"
              @focus="focusedField = 'telefone'"
              @blur="focusedField = ''"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              label="Email"
              v-model="cliente.email"
              prepend-inner-icon="mdi-email"
              type="email"
              clearable
              :class="{ 'focus-blue': focusedField === 'email' }"
              @focus="focusedField = 'email'"
              @blur="focusedField = ''"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              label="Data de Nascimento"
              v-model="cliente.dataNascimento"
              type="date"
              prepend-inner-icon="mdi-calendar"
              :class="{ 'focus-blue': focusedField === 'dataNascimento' }"
              @focus="focusedField = 'dataNascimento'"
              @blur="focusedField = ''"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              label="Localidade"
              v-model="cliente.localidade"
              prepend-inner-icon="mdi-map-marker"
              :class="{ 'focus-blue': focusedField === 'localidade' }"
              @focus="focusedField = 'localidade'"
              @blur="focusedField = ''"
            />
          </v-col>

          <v-col cols="12" md="8">
            <v-select
              label="Método de Pagamento"
              v-model="cliente.metodoPagamentoId"
              :items="metodosPagamento"
              item-title="tipo"
              item-value="id"
              clearable
              prepend-inner-icon="mdi-credit-card-outline"
              :class="{ 'focus-blue': focusedField === 'metodoPagamento' }"
              @focus="focusedField = 'metodoPagamento'"
              @blur="focusedField = ''"
              :menu-props="{ maxHeight: 300 }"
            />
          </v-col>

          <v-col cols="12" md="4" class="d-flex align-center">
            <v-btn color="primary" @click="dialogMetodoPagamento = true" class="mt-2" block>
              Cadastrar Método
            </v-btn>
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <v-row justify="center">
          <v-col cols="12" md="6">
            <v-btn color="primary" block size="large" prepend-icon="mdi-check" @click="submeterFormulario">
              Salvar Cliente
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-snackbar v-model="snackbar" :timeout="4000" color="green" location="top right">
      Cliente salvo com sucesso!
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">Fechar</v-btn>
      </template>
    </v-snackbar>

    <v-dialog v-model="dialogMetodoPagamento" max-width="500">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">Cadastrar Método de Pagamento</v-card-title>
        <v-card-text>
          <v-form ref="formMetodo" lazy-validation>
            <v-text-field label="Tipo" v-model="novoMetodo.tipo" required />
            <v-textarea label="Detalhes" v-model="novoMetodo.detalhes" rows="2" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogMetodoPagamento = false">Cancelar</v-btn>
          <v-btn color="primary" @click="cadastrarMetodoPagamento" :loading="loadingMetodo" :disabled="loadingMetodo || !novoMetodo.tipo">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from 'axios'
axios.defaults.withCredentials = true

function isValidDate(value: string): boolean {
  if (!value) return false
  const date = new Date(value)
  return !isNaN(date.getTime())
}
function formatToDateOnly(value: string): string {
  return new Date(value).toISOString().split('T')[0]
}

interface Cliente {
  nome: string
  telefone: string
  email: string | null  // Email agora é opcional
  dataNascimento: string | null
  localidade: string
  metodoPagamentoId?: number | null
}

export default defineComponent({
  name: 'FormCliSimplificado',
  setup() {
    const cliente = ref<Cliente>({
      nome: '',
      telefone: '',
      email: null,  // Valor inicial como null
      dataNascimento: '',
      localidade: '',
      metodoPagamentoId: null,
    })
    const metodosPagamento = ref<{ id: number; tipo: string; detalhes?: string }[]>([])
    const snackbar = ref(false)
    const focusedField = ref('')
    const dialogMetodoPagamento = ref(false)
    const novoMetodo = ref<{ tipo: string; detalhes: string }>({ tipo: '', detalhes: '' })
    const loadingMetodo = ref(false)
    const form = ref<HTMLFormElement | null>(null)

    onMounted(async () => {
      await carregarMetodosPagamento()
    })

    const carregarMetodosPagamento = async () => {
      try {
        const res = await axios.get('/todos-pagamento')
        metodosPagamento.value = res.data
      } catch {
        alert('Erro ao carregar métodos de pagamento.')
      }
    }

    const cadastrarMetodoPagamento = async () => {
      if (!novoMetodo.value.tipo) return
      loadingMetodo.value = true
      try {
        const res = await axios.post('/cadastrar-pagamento', {
          tipo: novoMetodo.value.tipo,
          detalhes: novoMetodo.value.detalhes,
        })
        metodosPagamento.value.push(res.data)
        cliente.value.metodoPagamentoId = res.data.id
        dialogMetodoPagamento.value = false
        novoMetodo.value = { tipo: '', detalhes: '' }
      } catch {
        alert('Erro ao cadastrar método de pagamento.')
      } finally {
        loadingMetodo.value = false
      }
    }

    const submeterFormulario = async () => {
      try {
        const payload = { ...cliente.value }
        payload.dataNascimento = isValidDate(payload.dataNascimento || '') ? formatToDateOnly(payload.dataNascimento!) : null

        await axios.post('/cadastrar-clientes', payload)

        snackbar.value = true
        form.value?.reset()
        cliente.value = {
          nome: '',
          telefone: '',
          email: null,  // Resetando email para null
          dataNascimento: '',
          localidade: '',
          metodoPagamentoId: null,
        }
      } catch {
        alert('Erro ao salvar cliente.')
      }
    }

    return {
      cliente,
      metodosPagamento,
      snackbar,
      focusedField,
      dialogMetodoPagamento,
      novoMetodo,
      loadingMetodo,
      cadastrarMetodoPagamento,
      submeterFormulario,
      form,
    }
  },
})
</script>

<style scoped>
::v-deep(.focus-blue .v-field__outline) {
  border-color: #1976d2 !important;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  transition: all 0.3s ease;
}
.btn-hoje {
  background: linear-gradient(to right, #42a5f5, #1e88e5);
  color: white;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.btn-hoje:hover {
  transform: scale(1.03);
  box-shadow: 0 6px 18px rgba(21, 101, 192, 0.5);
}
</style>
