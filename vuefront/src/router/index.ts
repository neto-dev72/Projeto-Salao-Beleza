import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import CadastroUsuario from '../views/cadastrarUsuarios.vue'
import CadastroCliente from '../views/cadastroCliente.vue'
import CadastroServico from '../views/cadastroServicos.vue'
import CadastroDespesa from '../views/cadastroDespesa.vue'
import GerarRelatorio from '../views/gerarRelatorio.vue'
import LoginUser from '../views/loginUsuarios.vue'
import GerirClientes from '../views/GerirClientes.vue'
import GerirAgendamento from '../views/GerirAgendamento.vue'
import PainelAnalitico from '../views/PainelAnalitico.vue'
import DesempenhoFuncionario from '../views/DesempenhoFuncionarios.vue'

import GestaooProdutos from '../views/GerirProdutos.vue'


import GestaoUsuario from '../components/GerirUsuarios.vue'


import Perfil from '../views/perfilUsuario.vue'




import GestaoSaloes from '../views/GerirSaloes.vue'



import GestaoProficionais from '../views/GerirProficionais.vue'



import Resumo from '../views/Resumo.vue'



import RelatorioClientes from '../views/RelatorioClientes.vue'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'LoginUser',
    component: LoginUser
  },
  {
    path: '/cadastro-usuario',
    name: 'CadastroUsuario',
    component: CadastroUsuario
  },
  {
    path: '/cadastro-cliente',
    name: 'CadastroCliente',
    component: CadastroCliente,
    meta: { requiresAuth: true }
  },
  {
    path: '/cadastro-servico',
    name: 'CadastroServico',
    component: CadastroServico,
    meta: { requiresAuth: true }
  },
  {
    path: '/cadastro-despesa',
    name: 'CadastroDespesa',
    component: CadastroDespesa,
    meta: { requiresAuth: true }
  },
  {
    path: '/gerar-relatorio',
    name: 'GerarRelatorio',
    component: GerarRelatorio,
    meta: { requiresAuth: true }
  },
  {
    path: '/gerir-clientes',
    name: 'gerirClientes',
    component: GerirClientes,
    meta: { requiresAuth: true }
  },
  {
    path: '/gerir-agendamentos',
    name: 'gerirAgendamentos',
    component: GerirAgendamento,
    meta: { requiresAuth: true }
  },
  {
    path: '/painel-analitico',
    name: 'painelanalitico',
    component: PainelAnalitico,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/desempenho-funcionarios',
    name: 'desempenhoFuncionario',
    component: DesempenhoFuncionario,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/meu-perfil',
    name: 'meuperfil',
    component: Perfil,
    meta: { requiresAuth: true }
  },
  {
    path: '/gestao-produtos',
    name: 'gestaoprodutos',
    component: GestaooProdutos,
    meta: { requiresAuth: true }
  },
  {
    path: '/gerir-saloes',
    name: 'gestaosaloes',
    component: GestaoSaloes,
    meta: { requiresAuth: true }
  },
  {
    path: '/gerir-usuarios',
    name: 'gestausuarios',
    component: GestaoUsuario,
    meta: { requiresAuth: true }
  },
  {
    path: '/resumo-dash',
    name: 'ResumoDash',
    component: Resumo,
    meta: { requiresAuth: true }
  },
  {
    path: '/gestao-funcionarios',
    name: 'GerirFuncionarios',
    component: GestaoProficionais,
    meta: { requiresAuth: true }
  },
  {
    path: '/relatorio-clientes',
    name: 'RelatorioClientes',
    component: RelatorioClientes,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 🔐 Proteção das rotas com token JWT e função de admin
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const usuarioStr = localStorage.getItem('usuario')
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null

  // Requer login
  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }

  // Requer permissão de administrador
  if (to.meta.requiresAdmin && (!usuario || usuario.funcao !== 'admin')) {
    return next('/') // ou criar uma rota tipo '/acesso-negado'
  }

  return next()
})

export default router
