<template>
  <v-container class="mt-8" max-width="600px">
    <!-- Editar dados -->
    <v-card class="mb-6">
      <v-card-title class="text-h6">Editar Dados do Usuário</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="atualizarDados" ref="formDados">
          <v-text-field v-model="dados.nome" label="Nome" required />
          <v-text-field v-model="dados.email" label="Email" type="email" required />
          <v-btn type="submit" color="primary" class="mt-2">Salvar Alterações</v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Alterar senha -->
    <v-card>
      <v-card-title class="text-h6">Alterar Senha</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="alterarSenha" ref="formSenha">
          <v-text-field
            v-model="senhaAtual"
            :type="mostrarSenhaAtual ? 'text' : 'password'"
            label="Senha Atual"
            required
            :append-icon="mostrarSenhaAtual ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append="mostrarSenhaAtual = !mostrarSenhaAtual"
          />
          <v-text-field
            v-model="novaSenha"
            type="password"
            label="Nova Senha"
            required
          />
          <v-btn type="submit" color="primary" class="mt-2">Atualizar Senha</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

const toast = useToast();
const token = localStorage.getItem('token');

// Dados do usuário
const dados = ref({ nome: '', email: '' });
const senhaAtual = ref('');
const novaSenha = ref('');
const mostrarSenhaAtual = ref(false);

// Carrega os dados ao entrar
async function carregarPerfil() {
  try {
    const res = await axios.get('/usuarios/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    dados.value = {
      nome: res.data.nome,
      email: res.data.email
    };
  } catch (err) {
    console.error('Erro ao carregar perfil:', err);
    toast.error('Erro ao carregar dados do usuário');
  }
}

// Atualiza nome e email
async function atualizarDados() {
  try {
    const res = await axios.put(
      '/usuarios/me/dados',
      dados.value,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success(res.data.mensagem || 'Dados atualizados com sucesso!');
  } catch (err: any) {
    console.error(err);
    toast.error(err.response?.data?.erro || 'Erro ao atualizar dados');
  }
}

// Atualiza senha
async function alterarSenha() {
  try {
    const res = await axios.put(
      '/usuarios/me/senha',
      {
        senhaAtual: senhaAtual.value,
        novaSenha: novaSenha.value
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success(res.data.mensagem || 'Senha atualizada com sucesso!');
    senhaAtual.value = '';
    novaSenha.value = '';
  } catch (err: any) {
    console.error(err);
    toast.error(err.response?.data?.erro || 'Erro ao atualizar senha');
  }
}

onMounted(() => {
  carregarPerfil();
});
</script>
