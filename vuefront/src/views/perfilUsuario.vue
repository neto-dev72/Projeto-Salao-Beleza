<template>
  <v-container class="mt-8" max-width="900px">
    <!-- PERFIL DO USUÁRIO -->
    <v-card class="pa-6 elevation-8 rounded-xl" style="backdrop-filter: blur(12px); background: rgba(250, 250, 250, 0.9); border: 1px solid #e0e0e0;">
      <v-card-title class="d-flex justify-space-between align-center mb-4">
        <div class="text-h5 font-weight-bold d-flex align-center">
          <v-icon color="primary" class="me-2">mdi-account-circle</v-icon>
          Perfil do Usuário
        </div>
        <v-btn color="primary" icon @click="modalEditar = true">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider class="mb-6" />

      <!-- DADOS DO USUÁRIO -->
      <v-row dense class="mb-2">
        <v-col cols="12" sm="6">
          <v-list-item class="pa-0">
            <v-list-item-icon><v-icon color="grey">mdi-account</v-icon></v-list-item-icon>
            <v-list-item-content><strong>Nome:</strong> {{ perfil.usuario.nome }}</v-list-item-content>
          </v-list-item>
        </v-col>
        <v-col cols="12" sm="6">
          <v-list-item class="pa-0">
            <v-list-item-icon><v-icon color="grey">mdi-email</v-icon></v-list-item-icon>
            <v-list-item-content><strong>Email:</strong> {{ perfil.usuario.email }}</v-list-item-content>
          </v-list-item>
        </v-col>
        <v-col cols="12" sm="6">
          <v-list-item class="pa-0">
            <v-list-item-icon><v-icon color="grey">mdi-briefcase</v-icon></v-list-item-icon>
            <v-list-item-content><strong>Função:</strong> {{ perfil.usuario.funcao }}</v-list-item-content>
          </v-list-item>
        </v-col>
        <v-col cols="12" sm="6">
          <v-list-item class="pa-0">
            <v-list-item-icon><v-icon color="grey">mdi-check-circle</v-icon></v-list-item-icon>
            <v-list-item-content>
              <strong>Status:</strong>
              <v-chip :color="perfil.usuario.ativo ? 'green' : 'red'" class="text-white" size="small">
                {{ perfil.usuario.ativo ? 'Ativo' : 'Inativo' }}
              </v-chip>
            </v-list-item-content>
          </v-list-item>
        </v-col>
        <v-col cols="12">
          <v-list-item class="pa-0">
            <v-list-item-icon><v-icon color="grey">mdi-calendar</v-icon></v-list-item-icon>
            <v-list-item-content>
              <strong>Conta criada em:</strong> {{ formatarData(perfil.usuario.createdAt) }}
            </v-list-item-content>
          </v-list-item>
        </v-col>
      </v-row>

      <!-- RESUMO DAS VENDAS -->
      <v-divider class="my-6" />

      <h3 class="text-subtitle-1 font-weight-bold mb-3">
        <v-icon color="blue-darken-2" class="me-2">mdi-finance</v-icon>
        Resumo das Vendas
      </h3>

      <v-row dense>
        <v-col cols="12" sm="6">
          <v-sheet class="pa-4 rounded-lg bg-blue-lighten-5 elevation-1 text-center">
            <strong>Total de Vendas:</strong><br />{{ perfil.totalVendas }}
          </v-sheet>
        </v-col>
        <v-col cols="12" sm="6">
          <v-sheet class="pa-4 rounded-lg bg-blue-lighten-5 elevation-1 text-center">
            <strong>Valor Total Vendido:</strong><br />
            Kz {{ Number(perfil.valorTotalVendido).toFixed(2) }}
          </v-sheet>
        </v-col>
      </v-row>

      <!-- ÚLTIMAS VENDAS (REESTILIZADO) -->
      <v-divider class="my-6" />

      <h3 class="text-subtitle-1 font-weight-bold mb-4">
        <v-icon color="teal-darken-2" class="me-2">mdi-history</v-icon>
        Últimas Vendas
      </h3>

      <v-row dense>
        <v-col
          v-for="(venda, index) in perfil.ultimasVendas"
          :key="index"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card class="pa-4 rounded-xl elevation-2">
            <div class="text-caption text-grey mb-1">
              <v-icon size="16" class="me-1" color="primary">mdi-calendar</v-icon>
              {{ formatarData(venda.dataVenda) }}
            </div>
            <div class="text-h6 font-weight-medium mb-2">
              Kz {{ Number(venda.valorTotal).toFixed(2) }}
            </div>
            <div class="text-body-2 text-grey-darken-1">
              {{ venda.observacoes || 'Sem observações' }}
            </div>
          </v-card>
        </v-col>
        <v-col v-if="perfil.ultimasVendas.length === 0" cols="12">
          <v-alert type="info" class="text-center">Nenhuma venda encontrada</v-alert>
        </v-col>
      </v-row>
    </v-card>

    <!-- DADOS ADMINISTRATIVOS -->
    <v-card
      v-if="perfil.usuario.funcao === 'admin'"
      class="mt-10 pa-6 elevation-4 rounded-xl bg-grey-lighten-5"
    >
      <v-card-title class="text-h6 font-weight-bold mb-3">
        <v-icon color="indigo" class="me-2">mdi-shield-account</v-icon>
        Dados Administrativos
      </v-card-title>

      <v-row dense>
        <v-col cols="12" sm="4">
          <v-sheet class="pa-4 bg-white rounded text-center elevation-1">
            <strong>Usuários:</strong><br />{{ perfil.adminExtra?.totalUsuarios }}
          </v-sheet>
        </v-col>
        <v-col cols="12" sm="4">
          <v-sheet class="pa-4 bg-white rounded text-center elevation-1">
            <strong>Clientes:</strong><br />{{ perfil.adminExtra?.totalClientes }}
          </v-sheet>
        </v-col>
        <v-col cols="12" sm="4">
          <v-sheet class="pa-4 bg-white rounded text-center elevation-1">
            <strong>Serviços:</strong><br />{{ perfil.adminExtra?.totalServicos }}
          </v-sheet>
        </v-col>
      </v-row>
    </v-card>

    <!-- MODAL EDITAR -->
    <v-dialog v-model="modalEditar" max-width="600">
      <v-card>
        <v-card-title class="text-h6">Editar Perfil</v-card-title>
        <v-card-text>
          <editarUsuario @atualizado="carregarPerfil" @fechar="modalEditar = false" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="modalEditar = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import editarUsuario from '@/components/editarUsuario.vue'; // ✅ permanece

interface Venda {
  dataVenda: string;
  valorTotal: number | string;
  observacoes: string | null;
}

interface Usuario {
  nome: string;
  email: string;
  funcao: string;
  ativo: boolean;
  createdAt: string;
}

interface AdminExtra {
  totalUsuarios: number;
  totalClientes: number;
  totalServicos: number;
}

interface PerfilData {
  usuario: Usuario;
  totalVendas: number;
  valorTotalVendido: number | string;
  ultimasVendas: Venda[];
  adminExtra?: AdminExtra;
}

const modalEditar = ref(false);

const perfil = ref<PerfilData>({
  usuario: {
    nome: '',
    email: '',
    funcao: '',
    ativo: true,
    createdAt: ''
  },
  totalVendas: 0,
  valorTotalVendido: 0,
  ultimasVendas: [],
  adminExtra: undefined
});

function formatarData(dataStr: string): string {
  if (!dataStr) return '-';
  const data = new Date(dataStr);
  return data.toLocaleDateString('pt-BR');
}

async function carregarPerfil() {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Usuário não autenticado');

    const resposta = await axios.get('/perfil', {
      headers: { Authorization: `Bearer ${token}` }
    });

    perfil.value = resposta.data;
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
  }
}

onMounted(() => {
  carregarPerfil();
});
</script>
