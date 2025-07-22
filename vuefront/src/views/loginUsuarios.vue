<template>
  <div class="pagina-login">
    <!-- Fundo gradiente rosa suave com imagem -->
    <div class="fundo-gradiente">
      <v-img
        src="@/assets/img/login1.jpg"
        alt="Imagem fundo login"
        class="image-fundo"
        lazy-src="@/assets/img/login3.jpg"
        cover
      ></v-img>
    </div>

    <!-- Conteúdo do formulário -->
    <v-container class="fill-height d-flex align-center justify-center" fluid>
      <v-card max-width="420" class="pa-8 rounded-lg elevation-12">
        <v-card-title class="text-h4 font-weight-bold text-center pink--text">
          Entrar no Sistema
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="fazerLogin" ref="form" class="form-login">
            <v-text-field
              v-model="credenciais.email"
              label="Email"
              type="email"
              required
              prepend-inner-icon="mdi-email-outline"
              color="pink"
              class="mb-6"
              density="comfortable"
            />

            <v-text-field
              v-model="credenciais.senha"
              :type="mostrarSenha ? 'text' : 'password'"
              label="Senha"
              required
              prepend-inner-icon="mdi-lock-outline"
              color="pink"
              class="mb-6"
              density="comfortable"
            >
              <template #append-inner>
                <v-icon @click="mostrarSenha = !mostrarSenha" class="cursor-pointer" color="pink">
                  {{ mostrarSenha ? 'mdi-eye-off' : 'mdi-eye' }}
                </v-icon>
              </template>
            </v-text-field>

            <v-btn
              type="submit"
              color="pink accent-3"
              dark
              block
              class="mb-6"
              :loading="carregando"
              elevation="6"
              rounded
              large
            >
              Entrar
            </v-btn>

            <v-alert
              v-if="erro"
              type="error"
              class="mb-6"
              dense
              border="left"
              colored-border
              elevation="2"
              dismissible
              @input="erro = ''"
            >
              {{ erro }}
            </v-alert>

            <div class="text-center">
              <span class="texto-secundario">Não tem uma conta?</span>
              <v-btn
                variant="text"
                color="pink accent-3"
                class="ml-2 font-weight-bold"
                @click="irParaCadastro"
              >
                Cadastrar-se
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'LoginUser',
  setup() {
    const credenciais = ref({ email: '', senha: '' });
    const mostrarSenha = ref(false);
    const erro = ref('');
    const carregando = ref(false);
    const form = ref<HTMLFormElement | null>(null);
    const router = useRouter();

    // 🔐 Redireciona se já tiver token (após reload)
    onMounted(() => {
      const token = localStorage.getItem('token');
      if (token) {
        router.push('/resumo-dash');
      }
    });

    const fazerLogin = async () => {
      erro.value = '';
      carregando.value = true;
      try {
        const { data } = await axios.post('/login', credenciais.value);
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        window.location.reload(); // mantém seu comportamento
      } catch (e: any) {
        erro.value = e.response?.data?.erro || 'Erro ao tentar login.';
      } finally {
        carregando.value = false;
      }
    };

    const irParaCadastro = () => {
      router.push('/cadastro-usuario');
    };

    return {
      credenciais,
      mostrarSenha,
      erro,
      fazerLogin,
      carregando,
      form,
      irParaCadastro,
    };
  },
});
</script>

<style scoped>
.pagina-login {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* Fundo gradiente e imagem de fundo */
.fundo-gradiente {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%);
  z-index: 0;
  filter: brightness(0.9);
}

.image-fundo {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
}

/* Card sobre o fundo */
.v-card {
  position: relative;
  z-index: 1;
  border-radius: 20px !important;
}

/* Textos secundários */
.texto-secundario {
  color: #880e4f;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-login .v-input__control {
  border-radius: 12px;
}

.cursor-pointer {
  cursor: pointer;
}

@media (max-width: 600px) {
  .v-card {
    margin: 0 12px;
  }
}
</style>
