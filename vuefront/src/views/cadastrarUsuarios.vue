<template>
  <div class="pagina-cadastro">
    <!-- Fundo com a imagem -->
    <div class="fundo-imagem" />

    <v-container class="fill-height d-flex align-center justify-center">
      
      <!-- ✅ Formulário Condicional -->
      <v-card v-if="mostrarFormulario" elevation="6" class="pa-6" max-width="500">
        <v-card-title class="text-h5 texto-secundario">Cadastro de Usuário</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="cadastrarUsuario" ref="form">
            <v-text-field label="Nome" v-model="usuario.nome" class="texto-secundario" required />
            <v-text-field label="Email" v-model="usuario.email" type="email" class="texto-secundario" required />
            <v-text-field
              label="Senha"
              v-model="usuario.senha"
              :type="mostrarSenha ? 'text' : 'password'"
              class="texto-secundario"
              required
            >
              <template #append-inner>
                <v-icon @click="mostrarSenha = !mostrarSenha" class="cursor-pointer texto-secundario">
                  {{ mostrarSenha ? 'mdi-eye-off' : 'mdi-eye' }}
                </v-icon>
              </template>
            </v-text-field>

            <v-select
              label="Função"
              v-model="usuario.funcao"
              :items="funcoesDisponiveis"
              class="texto-secundario"
              required
            />

            <!-- Botão de Cadastro com cor personalizada -->
            <v-btn type="submit" class="mt-4 btn-rosa" block>
              Cadastrar
            </v-btn>
          </v-form>

          <div class="text-center mt-6 texto-secundario">
            <span>Já tem uma conta?</span>
            <v-btn variant="text" class="btn-rosa" @click="irParaLogin">
              Fazer login
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- ❌ Bloqueado -->
      <div v-else class="text-center">
        <v-alert type="info" class="ma-6 alerta-desativado">
          O cadastro está desativado. Faça login para continuar.
        </v-alert>
        <v-btn class="btn-rosa" @click="irParaLogin">Ir para login</v-btn>
      </div>

      <!-- Mensagens -->
      <v-snackbar v-model="snackbar" :timeout="4000" color="green">
        Usuário cadastrado com sucesso!
      </v-snackbar>

      <div v-if="usuarioLogado" class="text-center mt-6">
        <v-alert type="success" class="alerta-desativado">
          Bem-vindo, {{ usuarioLogado.nome }}!
        </v-alert>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'CadastroUsuario',
  setup() {
    const router = useRouter();

    const usuario = ref({
      nome: '',
      email: '',
      senha: '',
      funcao: ''
    });

    const mostrarSenha = ref(false);
    const snackbar = ref(false);
    const usuarioLogado = ref<any>(null);
    const superAdminExiste = ref(true);
    const form = ref<HTMLFormElement | null>(null);

    const todasFuncoes = ['super_admin', 'admin', 'recepcionista', 'profissional'];

    const verificarSeSuperAdminExiste = async () => {
      try {
        const { data } = await axios.get('/usuarios/existe-superadmin');
        superAdminExiste.value = data.superAdminExiste;
      } catch (error) {
        console.error('Erro ao verificar super_admin existente:', error);
      }
    };

    const carregarUsuarioLogado = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const { data } = await axios.get('/usuarios/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        usuarioLogado.value = data.usuario;
      } catch (error) {
        console.error('Erro ao carregar usuário logado:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    };

    const funcoesDisponiveis = computed(() => {
      if (!superAdminExiste.value && !usuarioLogado.value) {
        return ['super_admin']; // caso inicial
      }

      if (usuarioLogado.value?.funcao === 'super_admin') {
        return ['admin', 'recepcionista', 'profissional'];
      }

      if (usuarioLogado.value?.funcao === 'admin') {
        return ['recepcionista', 'profissional'];
      }

      return [];
    });

    const mostrarFormulario = computed(() => {
      return (
        (!superAdminExiste.value && !usuarioLogado.value) ||
        usuarioLogado.value?.funcao === 'super_admin'
      );
    });

    const cadastrarUsuario = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.post('/usuarios', usuario.value, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        snackbar.value = true;
        form.value?.reset();
      } catch (error: any) {
        console.error('Erro ao cadastrar:', error);
        alert(error.response?.data?.erro || 'Erro ao cadastrar usuário.');
      }
    };

    const irParaLogin = () => {
      router.push('/login');
    };

    onMounted(() => {
      carregarUsuarioLogado();
      verificarSeSuperAdminExiste();
    });

    return {
      usuario,
      cadastrarUsuario,
      snackbar,
      form,
      usuarioLogado,
      funcoesDisponiveis,
      mostrarFormulario,
      mostrarSenha,
      irParaLogin
    };
  }
});
</script>

<style scoped>
.pagina-cadastro {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* Fundo com a imagem */
.fundo-imagem {
  position: absolute;
  inset: 0;
  background: url('@/assets/img/login1.jpg') no-repeat center center;
  background-size: cover;
  filter: brightness(0.5);
  z-index: 0;
}

/* Estilo do formulário */
.v-container {
  position: relative;
  z-index: 1;
}

/* Ajuste do formulário */
.v-card {
  border-radius: 20px !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* Estilo dos textos */
.texto-secundario {
  color: #880e4f; /* Vinho */
  font-weight: 500;
  font-size: 0.95rem;
}

/* Estilo do alerta quando o cadastro está desativado */
.alerta-desativado {
  background-color: #880e4f !important; /* Vinho */
  color: white;
  border-radius: 8px;
}

/* Estilo do alerta de tipo info */
.v-alert[type='info'] {
  background-color: #880e4f !important; /* Vinho */
  color: white !important;
  border-radius: 8px;
}

/* Botões com cor personalizada */
.btn-rosa {
  background-color: #880e4f; /* Vinho */
  color: white !important;
  border-radius: 8px;
  font-weight: bold;
}

.btn-rosa:hover {
  background-color: #ad1457; /* Vinho mais escuro */
}

/* Outras classes */
.cursor-pointer {
  cursor: pointer;
}

.form-login .v-input__control {
  border-radius: 12px;
}

/* Responsividade */
@media (max-width: 600px) {
  .v-card {
    margin: 0 12px;
  }
}
</style>
