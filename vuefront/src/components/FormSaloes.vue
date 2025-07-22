<template>
  <v-container class="py-10">
    <v-card max-width="600" class="mx-auto pa-6" elevation="10">
      <v-card-title class="text-h5">Cadastro de Salão e Dono</v-card-title>

      <v-card-text class="scrollable-form">
        <v-form @submit.prevent="cadastrarSalao" ref="formRef">
          <!-- DADOS DO SALÃO -->
          <v-divider class="mb-4" />
          <h4 class="text-subtitle-1 mb-2">Dados do Salão</h4>
          <v-text-field label="Nome do Salão" v-model="salao.nomeSalao" required />
          <v-text-field label="Endereço" v-model="salao.endereco" />
          <v-text-field label="Telefone" v-model="salao.telefone" />

          <!-- DADOS DO DONO -->
          <v-divider class="my-4" />
          <h4 class="text-subtitle-1 mb-2">Dados do Dono (Admin)</h4>
          <v-text-field label="Nome do Dono" v-model="salao.dono.nome" required />
          <v-text-field label="Email" v-model="salao.dono.email" type="email" required />
          <v-text-field
            label="Senha"
            v-model="salao.dono.senha"
            :type="mostrarSenha ? 'text' : 'password'"
            required
          >
            <template #append-inner>
              <v-icon @click="mostrarSenha = !mostrarSenha" class="cursor-pointer">
                {{ mostrarSenha ? 'mdi-eye-off' : 'mdi-eye' }}
              </v-icon>
            </template>
          </v-text-field>

          <v-btn type="submit" color="primary" class="mt-4" block>
            Cadastrar Salão e Dono
          </v-btn>
        </v-form>

        <v-snackbar v-model="snackbar" color="green" timeout="4000">
          {{ mensagem }}
        </v-snackbar>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'FormSaloes',
  setup() {
    const salao = ref({
      nomeSalao: '',
      endereco: '',
      telefone: '',
      dono: {
        nome: '',
        email: '',
        senha: ''
      }
    });

    const mostrarSenha = ref(false);
    const snackbar = ref(false);
    const mensagem = ref('');
    const formRef = ref<HTMLFormElement | null>(null);

    const cadastrarSalao = async () => {
      try {
        const token = localStorage.getItem('token');

        const { data } = await axios.post('/saloes', salao.value, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        mensagem.value = data.mensagem;
        snackbar.value = true;
        formRef.value?.reset();

        // Limpa os campos após o submit
        salao.value = {
          nomeSalao: '',
          endereco: '',
          telefone: '',
          dono: {
            nome: '',
            email: '',
            senha: ''
          }
        };
      } catch (error: any) {
        console.error('Erro ao cadastrar salão:', error);
        alert(error.response?.data?.erro || 'Erro ao cadastrar salão e dono.');
      }
    };

    return {
      salao,
      cadastrarSalao,
      mostrarSenha,
      snackbar,
      mensagem,
      formRef
    };
  }
});
</script>

<style scoped>
.text-subtitle-1 {
  font-weight: 600;
}

.scrollable-form {
  max-height: 400px;
  overflow-y: auto;
}
</style>
