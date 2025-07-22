<template>
  <v-card elevation="8" class="pa-6 mx-auto mt-10 animate__animated animate__fadeIn" max-width="600">
    <v-card-title class="text-h4 font-weight-bold mb-2">
      <v-icon color="primary" class="mr-2">mdi-account-plus</v-icon>
      Cadastro de Funcionário
    </v-card-title>
    <v-divider class="mb-6" />

    <v-card-text>
      <v-form ref="form" validate-on="submit lazy">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
              label="Nome completo"
              v-model="funcionario.nome"
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
              label="Função"
              v-model="funcionario.funcao"
              prepend-inner-icon="mdi-briefcase"
              clearable
              required
              :class="{ 'focus-blue': focusedField === 'funcao' }"
              @focus="focusedField = 'funcao'"
              @blur="focusedField = ''"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-checkbox
              label="Ativo"
              v-model="funcionario.ativo"
              color="primary"
              :class="{ 'focus-blue': focusedField === 'ativo' }"
              @focus="focusedField = 'ativo'"
              @blur="focusedField = ''"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              label="Data de Admissão"
              v-model="funcionario.dataAdmissao"
              type="date"
              prepend-inner-icon="mdi-calendar"
              :class="{ 'focus-blue': focusedField === 'dataAdmissao' }"
              @focus="focusedField = 'dataAdmissao'"
              @blur="focusedField = ''"
            />
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <v-row justify="center">
          <v-col cols="12" md="6">
            <v-btn color="primary" block size="large" prepend-icon="mdi-check" @click="submeterFormulario">
              Salvar Funcionário
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <!-- Snackbar de sucesso -->
    <v-snackbar v-model="snackbar" :timeout="4000" color="green" location="top right">
      Funcionário salvo com sucesso!
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">Fechar</v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'

interface Funcionario {
  nome: string
  funcao: string
  ativo: boolean
  dataAdmissao: string
}

export default defineComponent({
  name: 'FormFuncionario',
  setup() {
    const funcionario = ref<Funcionario>({
      nome: '',
      funcao: '',
      ativo: true,
      dataAdmissao: '',
    })

    const snackbar = ref(false)
    const focusedField = ref('')
    const form = ref<HTMLFormElement | null>(null)

    const submeterFormulario = async () => {
      try {
        const payload = { ...funcionario.value }
        payload.dataAdmissao = payload.dataAdmissao ? new Date(payload.dataAdmissao).toISOString().split('T')[0] : ''

        // Enviar dados do funcionário para a API
        await axios.post('/cadastrar-funcionarios', payload)

        snackbar.value = true
        form.value?.reset()
        funcionario.value = {
          nome: '',
          funcao: '',
          ativo: true,
          dataAdmissao: '',
        }
      } catch {
        alert('Erro ao salvar funcionário.')
      }
    }

    return {
      funcionario,
      snackbar,
      focusedField,
      submeterFormulario,
      form,
    }
  }
})
</script>

<style scoped>
::v-deep(.focus-blue .v-field__outline) {
  border-color: #1976d2 !important;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  transition: all 0.3s ease;
}
</style>
