<template>
  <div>
    <!-- Mostrar SalaoBlocked se o salão estiver bloqueado -->
    <SalaoBlocked v-if="salaoBloqueado" />
    
    <!-- Caso contrário, renderiza a página normal -->
    <div v-else>
      <!-- HERO -->
      <div class="hero-bg">
        <v-container class="hero-section pa-0">
          <v-row align="center" justify="center" no-gutters class="fill-height">
            <!-- Imagem -->
            <v-col cols="12" md="6" class="d-flex justify-center px-4">
              <v-img
                src="@/assets/img/home-img5.png"
                alt="Imagem salão de beleza"
                class="rounded-lg elevation-14 image-primary"
                lazy-src="@/assets/img/home-img2.jpg"
                cover
              ></v-img>
            </v-col>

            <!-- Texto -->
            <v-col cols="12" md="6" class="text-center text-md-left px-12">
              <h1 class="display-2 font-weight-black mb-6 hero-title">
                Tecnologia que valoriza o <span class="highlight">cuidado</span> com cada cliente.
              </h1>
              <p class="subtitle-1 mb-8 hero-subtitle">
                Gestão moderna e eficiente para salões que encantam e fidelizam.
              </p>
              <v-btn
                color="pink accent-3"
                dark
                large
                rounded
                elevation="8"
                class="hero-btn"
                to="/login"
              >
                Entrar
                <v-icon right>mdi-arrow-right</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- VANTAGENS -->
      <div class="vantagens-bg py-12">
        <v-container>
          <v-row justify="center" align="center" dense>
            <v-col cols="12" md="4" class="text-center mb-8">
              <v-icon size="48" color="pink accent-3">mdi-speedometer</v-icon>
              <h3 class="font-weight-bold mt-4 mb-2">Alta performance</h3>
              <p class="subtitle-2 mx-auto" style="max-width: 300px;">
                Plataforma rápida e estável para agilizar sua gestão diária.
              </p>
            </v-col>
            <v-col cols="12" md="4" class="text-center mb-8">
              <v-icon size="48" color="pink accent-3">mdi-account-group</v-icon>
              <h3 class="font-weight-bold mt-4 mb-2">Fidelização</h3>
              <p class="subtitle-2 mx-auto" style="max-width: 300px;">
                Ferramentas que ajudam a manter seus clientes sempre satisfeitos.
              </p>
            </v-col>
            <v-col cols="12" md="4" class="text-center mb-8">
              <v-icon size="48" color="pink accent-3">mdi-cog-outline</v-icon>
              <h3 class="font-weight-bold mt-4 mb-2">Personalização</h3>
              <p class="subtitle-2 mx-auto" style="max-width: 300px;">
                Adapte o sistema às necessidades específicas do seu salão.
              </p>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- FOOTER -->
      <v-footer class="footer-section" padless>
        <v-container>
          <v-row class="py-10" justify="space-between">
            <v-col cols="12" md="3" class="mb-6">
              <h3 class="footer-title mb-4">Sobre Bernet</h3>
              <p class="footer-text">
                Bernet é uma plataforma inovadora que ajuda salões em Angola a oferecerem atendimento de excelência, com tecnologia e carinho.
              </p>
            </v-col>

            <v-col cols="12" md="3" class="mb-6">
              <h3 class="footer-title mb-4">Links Úteis</h3>
              <v-list dense nav>
                <v-list-item link href="/"><v-list-item-content><v-list-item-title>Início</v-list-item-title></v-list-item-content></v-list-item>
                <v-list-item link href="/sobre"><v-list-item-content><v-list-item-title>Sobre</v-list-item-title></v-list-item-content></v-list-item>
                <v-list-item link href="/servicos"><v-list-item-content><v-list-item-title>Serviços</v-list-item-title></v-list-item-content></v-list-item>
                <v-list-item link href="/contato"><v-list-item-content><v-list-item-title>Contato</v-list-item-title></v-list-item-content></v-list-item>
              </v-list>
            </v-col>

            <v-col cols="12" md="3" class="mb-6">
              <h3 class="footer-title mb-4">Contato</h3>
              <p class="footer-text mb-1">Email: <a href="mailto:suporte@bernetsistema.com" class="footer-link">suporte@bernetsistema.com</a></p>
              <p class="footer-text mb-1">Telefone: <a href="tel:+244923519571" class="footer-link">+244 923 519 571</a></p>
              <p class="footer-text">Localização: Luanda, Angola</p>
            </v-col>

            <v-col cols="12" md="3" class="mb-6">
              <h3 class="footer-title mb-4">Redes Sociais</h3>
              <v-btn icon href="https://facebook.com" target="_blank" color="pink accent-3"><v-icon size="28">mdi-facebook</v-icon></v-btn>
              <v-btn icon href="https://instagram.com" target="_blank" color="pink accent-3"><v-icon size="28">mdi-instagram</v-icon></v-btn>
              <v-btn icon href="https://twitter.com" target="_blank" color="pink accent-3"><v-icon size="28">mdi-twitter</v-icon></v-btn>
              <v-btn icon href="https://linkedin.com" target="_blank" color="pink accent-3"><v-icon size="28">mdi-linkedin</v-icon></v-btn>
            </v-col>
          </v-row>

          <v-divider color="#d81b60" />

          <v-row justify="center" class="py-6">
            <v-col cols="12" class="text-center footer-copy">
              © 2025 Bernet — Todos os direitos reservados
            </v-col>
          </v-row>
        </v-container>
      </v-footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import SalaoBlocked from '@/components/SalonBlocked.vue'

const salaoBloqueado = ref(false)

const verificarSalaoStatus = async () => {
  try {
    const response = await axios.get('http://localhost:9000/meu-usuario-e-salao', {
      withCredentials: true // caso você use cookies para autenticação
    })

    const salao = response.data.usuario?.Salão
    if (salao?.status === 'bloqueado') {
      salaoBloqueado.value = true
    }
  } catch (error) {
    console.error('Erro ao verificar status do salão:', error)
    // Se houver erro, considera mostrar algo ou logar o usuário
  }
}

onMounted(() => {
  verificarSalaoStatus()
})
</script>

<style scoped>
/* MANTÉM TODOS OS ESTILOS DA SUA VERSÃO ATUAL */
.hero-bg {
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%);
  box-shadow: inset 0 0 40px rgba(255, 192, 203, 0.25);
  width: 100%;
  min-height: 90vh;
  display: flex;
  align-items: center;
}

.hero-section {
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 0;
  padding-bottom: 0;
}

.rounded-lg {
  border-radius: 20px !important;
}

.image-primary {
  width: 100%;
  height: 480px;
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
  text-shadow: 1px 1px 3px rgba(136, 14, 79, 0.3);
}

.highlight {
  color: #d81b60;
  font-style: italic;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #6a1b9a;
  font-weight: 500;
}

.hero-btn {
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}

.hero-btn:hover {
  background-color: #c2185b !important;
  box-shadow: 0 8px 20px rgba(194, 24, 91, 0.6);
  transform: translateY(-2px);
}

.vantagens-bg {
  background: #f8bbd0;
  width: 100%;
}

.vantagens-bg h3 {
  color: #880e4f;
}

.vantagens-bg p {
  color: #4a148c;
}

.footer-section {
  background: #880e4f;
  color: white;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
}

.footer-title {
  font-weight: 700;
  font-size: 1.25rem;
  color: #f48fb1;
}

.footer-text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #f3e5f5;
}

.footer-link {
  color: #f48fb1;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #fff;
  text-decoration: underline;
}

.v-btn {
  margin-right: 8px;
}

.v-divider {
  margin-top: 0;
  margin-bottom: 16px;
  opacity: 0.4;
}

.footer-copy {
  font-size: 0.9rem;
  color: #f8bbd0;
}

@media (max-width: 960px) {
  .hero-title {
    font-size: 2.5rem;
  }
  .hero-subtitle {
    font-size: 1.1rem;
  }
  .px-12 {
    padding-left: 24px !important;
    padding-right: 24px !important;
  }
  .image-primary {
    height: 360px;
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 2rem;
  }
  .hero-subtitle {
    font-size: 1rem;
  }
  .v-row {
    flex-direction: column-reverse !important;
  }
  .px-12 {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
  .hero-bg {
    min-height: 75vh;
  }
  .image-primary {
    height: 280px;
  }
  .footer-section {
    text-align: center;
  }
  .v-row > .v-col {
    margin-bottom: 24px;
  }
  .v-btn {
    margin-right: 12px;
  }
}
</style>
