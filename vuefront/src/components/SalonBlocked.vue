<template>
  <div class="blocked-hero-bg">
    <v-container class="hero-section pa-0">
      <v-row align="center" justify="center" no-gutters class="fill-height">
        <!-- Imagem -->
        <v-col cols="12" md="6" class="d-flex justify-center px-4">
          <v-img
            src="@/assets/img/blocked.jpg"
            alt="Salão bloqueado"
            class="rounded-lg elevation-14 image-primary"
            lazy-src="@/assets/img/home-img2.jpg"
            cover
          />
        </v-col>

        <!-- Texto -->
        <v-col cols="12" md="6" class="text-center text-md-left px-12">
          <h1 class="display-2 font-weight-black mb-6 hero-title">
            Seu salão está <span class="highlight">bloqueado</span>
          </h1>
          <p class="subtitle-1 mb-8 hero-subtitle">
            Entre em contato com o suporte para reativar o acesso e continuar oferecendo o melhor atendimento aos seus clientes.
          </p>
          <v-btn
            color="pink accent-3"
            dark
            large
            rounded
            elevation="8"
            class="hero-btn"
            href="mailto:suporte@bernetsistema.com"
          >
            Falar com suporte
            <v-icon right>mdi-email</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.blocked-hero-bg {
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
  .blocked-hero-bg {
    min-height: 75vh;
  }
  .image-primary {
    height: 280px;
  }
}
</style>
