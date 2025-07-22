<template>
  <v-app-bar
    app
    :class="[{ 'scrolled': isScrolled }, 'navbar']"
    dark
    elevate-on-scroll
    flat
  >
    <!-- Ícone hambúrguer com toggle -->
    <v-app-bar-nav-icon class="d-md-none toggler" @click="drawer = !drawer">
      <v-icon>{{ drawer ? 'mdi-close' : 'mdi-menu' }}</v-icon>
    </v-app-bar-nav-icon>

    <!-- Logo -->
    <v-toolbar-title class="logo-title">
      <img :src="logo" alt="Logo Bernet" class="logo-img" />
    </v-toolbar-title>

    <v-spacer />

    <!-- Menu horizontal para telas maiores -->
    <template v-for="item in menus" :key="item.title">
      <v-btn
        v-if="!item.submenus"
        text
        class="nav-btn d-none d-md-flex"
        @click="navigateTo(item.route)"
      >
        <v-icon left>
          <!-- Ícone especial para Produtos: carrinho -->
          {{ item.title === 'De Produtos' || item.title === 'Produtos' ? 'mdi-cart' : item.icon }}
        </v-icon>
        {{ item.title }}
        <v-badge
          v-if="item.title === 'Agendamentos' && agendamentosCount > 0"
          :content="agendamentosCount"
          color="pink"
          overlap
          class="ml-2"
        ></v-badge>
      </v-btn>

      <v-menu
        v-else
        offset-y
        open-on-hover
        bottom
        class="d-none d-md-flex"
      >
        <template #activator="{ props }">
          <v-btn v-bind="props" text class="nav-btn">
            <v-icon left>{{ item.icon }}</v-icon>
            {{ item.title }}
            <v-icon right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="subitem in item.submenus"
            :key="subitem.title"
            @click="navigateTo(subitem.route)"
            link
          >
            <v-list-item-icon>
              <v-icon>
                <!-- Ícone especial para produtos dentro do submenu: carrinho -->
                {{ subitem.title === 'De Produtos' || subitem.title === 'Produtos' ? 'mdi-cart' : subitem.icon }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ subitem.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <!-- Botão Terminar Sessão, com ícone trocado -->
    <v-btn
      v-if="isLoggedIn"
      text
      @click="logout"
      class="logout-btn d-none d-md-flex"
    >
      <v-icon left>mdi-exit-to-app</v-icon>
      Terminar Sessão
    </v-btn>
  </v-app-bar>

  <!-- Drawer lateral -->
  <v-navigation-drawer
    v-model="drawer"
    app
    temporary
    class="d-md-none sidebar"
  >
    <v-list dense nav>
      <template v-for="item in menus" :key="item.title">
        <v-list-group
          v-if="item.submenus"
          no-action
          v-model="expanded[item.title]"
          class="sidebar-group"
        >
          <template #activator>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>
              <v-icon>{{ expanded[item.title] ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-list-item>
          </template>

          <v-list-item
            v-for="sub in item.submenus"
            :key="sub.title"
            @click="navigateTo(sub.route)"
            link
            class="sidebar-subitem"
          >
            <v-list-item-icon>
              <v-icon>
                <!-- Ícone carrinho para produtos no drawer -->
                {{ sub.title === 'De Produtos' || sub.title === 'Produtos' ? 'mdi-cart' : sub.icon }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ sub.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>

        <v-list-item
          v-else
          @click="navigateTo(item.route)"
          link
          class="d-flex align-center justify-space-between"
        >
          <v-list-item-icon>
            <v-icon>
              {{ item.title === 'De Produtos' || item.title === 'Produtos' ? 'mdi-cart' : item.icon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
          <v-badge
            v-if="item.title === 'Agendamentos' && agendamentosCount > 0"
            :content="agendamentosCount"
            color="pink"
            overlap
          ></v-badge>
        </v-list-item>
      </template>

      <v-divider class="my-2"></v-divider>

      <!-- Botão Terminar Sessão com ícone trocado no drawer -->
      <v-list-item v-if="isLoggedIn" @click="logout" link>
        <v-list-item-icon>
          <v-icon>mdi-exit-to-app</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Terminar Sessão</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, onUnmounted, reactive } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import LogoBernet from "@/assets/img/Logo-Bernet.png";

export default defineComponent({
  name: "Navigation",
  setup() {
    const logo = LogoBernet;
    const token = ref<string | null>(localStorage.getItem("token"));
    const menus = ref<Array<any>>([]);
    const router = useRouter();
    const drawer = ref(false);
    const expanded = reactive<{ [key: string]: boolean }>({});
    const isLoggedIn = computed(() => !!token.value);
    const agendamentosCount = ref(0);
    let intervalId: number | undefined;

    const buildMenus = (usuario: any, salao: any) => {
      if (usuario.funcao === "super_admin") {
        menus.value = [
          { title: "Home", route: "/", icon: "mdi-home" },
          { title: "Gerir Salões", route: "/gerir-saloes", icon: "mdi-store" },
        ];
        return;
      }
      if (!salao || salao.status === "pendente" || salao.status === "bloqueado") {
        menus.value = [
          { title: "Home", route: "/", icon: "mdi-home" },
          { title: "Login", route: "/login", icon: "mdi-login" },
          { title: "Contato", route: "/contato", icon: "mdi-phone" },
        ];
        return;
      }
      switch (usuario.funcao) {
        case "admin":
          menus.value = [
            { title: "Home", route: "/", icon: "mdi-home" },
            { title: "Resumo", route: "/resumo-dash", icon: "mdi-view-dashboard" },
            {
              title: "Gestão",
              icon: "mdi-folder-settings",
              submenus: [
                { title: "Gestão de Usuários", route: "/gerir-usuarios", icon: "mdi-account-group" },
                { title: "Gestão de Clientes", route: "/gerir-clientes", icon: "mdi-account-multiple" },
                { title: "De Produtos", route: "/gestao-produtos", icon: "mdi-cart" },
                { title: "De Serviços", route: "/cadastro-servico", icon: "mdi-scissors-cutting" },
                { title: "De Funcionários", route: "/gestao-funcionarios", icon: "mdi-account-tie" },
              ],
            },
            {
              title: "Relatórios",
              route: "",
              icon: "mdi-file-chart",
              submenus: [
                { title: "Relatório de Vendas", route: "/gerar-relatorio", icon: "mdi-cash-register" },
                { title: "Relatório de Funcionários", route: "/desempenho-funcionarios", icon: "mdi-account-tie" },
                { title: "Relatório de Clientes", route: "/relatorio-clientes", icon: "mdi-account-multiple" },
                { title: "Painel Analítico", route: "/painel-analitico", icon: "mdi-chart-box-outline" },
              ],
            },
            { title: "Despesas", route: "/cadastro-despesa", icon: "mdi-cash-minus" },
            { title: "Agendamentos", route: "/gerir-agendamentos", icon: "mdi-calendar-check" },
            { title: "Perfil", route: "/meu-perfil", icon: "mdi-account" },
          ];
          break;
        case "recepcionista":
          menus.value = [
            { title: "Home", route: "/", icon: "mdi-home" },
            { title: "Resumo", route: "/resumo-dash", icon: "mdi-view-dashboard" },
            {
              title: "Gestão De",
              icon: "mdi-folder-settings",
              submenus: [
                { title: "Clientes", route: "/gerir-clientes", icon: "mdi-account-multiple" },
                { title: "Produtos", route: "/gestao-produtos", icon: "mdi-cart" },
                { title: "Serviços", route: "/cadastro-servico", icon: "mdi-scissors-cutting" },
              ],
            },
            {
              title: "Relatório De",
              icon: "mdi-file-chart",
              submenus: [
                { title: "De Clientes", route: "/relatorio-clientes", icon: "mdi-account-multiple" },
                { title: "De Venda", route: "/gerar-relatorio", icon: "mdi-cash-register" },
              ],
            },
            { title: "Despesas", route: "/cadastro-despesa", icon: "mdi-cash-minus" },
            { title: "Agendamentos", route: "/gerir-agendamentos", icon: "mdi-calendar-check" },
            { title: "Perfil", route: "/meu-perfil", icon: "mdi-account" },
          ];
          break;
        case "profissional":
          menus.value = [
            { title: "Home", route: "/", icon: "mdi-home" },
            { title: "Serviços", route: "/servicos", icon: "mdi-scissors-cutting" },
          ];
          break;
        default:
          menus.value = [{ title: "Home", route: "/", icon: "mdi-home" }];
      }
    };

    const fetchUserAndSalao = async () => {
      if (!token.value) {
        buildMenus({}, null);
        return;
      }
      try {
        const { data } = await axios.get("/meu-usuario-e-salao", {
          headers: { Authorization: `Bearer ${token.value}` },
        });
        buildMenus(data.usuario, data.usuario.Salão);
      } catch {
        buildMenus({}, null);
      }
    };

    const fetchAgendamentosCount = async () => {
      if (!token.value) {
        agendamentosCount.value = 0;
        return;
      }
      try {
        const res = await axios.get("/contador-agendamentos", {
          headers: { Authorization: `Bearer ${token.value}` },
        });
        agendamentosCount.value = res.data.count ?? 0;
      } catch {
        agendamentosCount.value = 0;
      }
    };

    watch(
      token,
      () => {
        fetchUserAndSalao();
        fetchAgendamentosCount();
        if (intervalId) clearInterval(intervalId);
        intervalId = window.setInterval(fetchAgendamentosCount, 10000);
      },
      { immediate: true }
    );

    const navigateTo = (route: string) => {
      router.push(route);
      drawer.value = false;
    };

    const logout = async () => {
      await axios
        .get("/logout")
        .catch(() => console.warn("Erro ao deslogar"));
      localStorage.removeItem("token");
      token.value = null;
      navigateTo("/login");
    };

    const isScrolled = ref(false);
    const onScroll = () => (isScrolled.value = window.scrollY > 50);

    onMounted(() => {
      window.addEventListener("scroll", onScroll);
      fetchAgendamentosCount();
    });
    onUnmounted(() => {
      window.removeEventListener("scroll", onScroll);
      if (intervalId) clearInterval(intervalId);
    });

    return {
      logo,
      menus,
      isLoggedIn,
      agendamentosCount,
      drawer,
      expanded,
      isScrolled,
      navigateTo,
      logout,
    };
  },
});
</script>


<style scoped>
.navbar {
  background-color: rgba(248, 187, 208, 0.7);
  transition: 0.3s ease;
  color: #880e4f;
}
.navbar.scrolled {
  background-color: #880e4f !important;
  color: #fff !important;
  box-shadow: 0 2px 10px rgba(136, 14, 79, 0.7);
}
.nav-btn {
  font-weight: 600;
  text-transform: none;
}
.nav-btn:hover {
  color: #d81b60 !important;
}
.logout-btn {
  font-weight: 700;
  color: #f48fb1;
}
.logout-btn:hover {
  color: #d81b60 !important;
}
.v-icon {
  color: inherit;
}
.logo-img {
  height: 160px;
  max-width: 500px;
  object-fit: contain;
}
.sidebar {
  background-color: rgba(248, 187, 208, 0.95) !important;
}
.sidebar-group .v-list-item-title,
.sidebar-subitem .v-list-item-title {
  color: #880e4f;
  font-weight: 600;
}
.sidebar-subitem:hover .v-list-item-title {
  color: #d81b60 !important;
}
@media (max-width: 900px) {
  .logo-img {
    height: 90px;
    max-width: 350px;
  }
  .d-md-none {
    display: inline-flex !important;
  }
  .d-none {
    display: none !important;
  }
  .d-md-flex {
    display: none !important;
  }
}
@media (min-width: 901px) {
  .d-md-flex {
    display: inline-flex !important;
  }
  .d-md-none {
    display: none !important;
  }
}
</style>
