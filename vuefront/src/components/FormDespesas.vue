<template>
  <v-container class="py-10">
    <v-card elevation="6" class="pa-6 mx-auto" max-width="600">
      <v-card-title class="text-h5">Cadastro de Despesa</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="cadastrarDespesa" ref="form">
          <v-text-field label="Descrição" v-model="despesa.descricao" required />
          <v-text-field label="Valor" v-model="despesa.valor" type="number" required />
          
          <v-select
            label="Tipo"
            :items="['Fixa', 'Variável']"
            v-model="despesa.tipo"
            required
          />

          <v-text-field
            label="Data da Despesa"
            v-model="despesa.dataDespesa"
            type="date"
            required
          />

          <v-textarea label="Observações" v-model="despesa.observacoes" />

          <v-btn type="submit" color="primary" class="mt-4">Cadastrar</v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar" :timeout="4000" color="green">
      Despesa cadastrada com sucesso!
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';
axios.defaults.withCredentials = true;

export default defineComponent({
  name: 'CadastroDespesa',
  setup() {
    const despesa = ref({
      descricao: '',
      valor: 0,
      tipo: '',
      dataDespesa: '',
      observacoes: ''
    });

    const snackbar = ref(false);
    const form = ref<HTMLFormElement | null>(null);

    const cadastrarDespesa = async () => {
      try {
        await axios.post('/cadastrar-despesas', despesa.value);
        snackbar.value = true;
        form.value?.reset();
      } catch (error: any) {
        console.error('Erro ao cadastrar despesa:', error);
        alert(error.response?.data?.erro || 'Erro ao cadastrar despesa.');
      }
    };

    return {
      despesa,
      cadastrarDespesa,
      snackbar,
      form
    };
  }
});
</script>
