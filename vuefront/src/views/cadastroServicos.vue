<template>
  <v-container class="py-10">
    <!-- SNACKBAR -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="4000"
      location="top right"
      elevation="6"
    >
      {{ snackbar.text }}
    </v-snackbar>

    <!-- DIALOG DE EXCLUSÃO -->
    <v-dialog v-model="confirmarExclusao.show" max-width="400" scrollable>
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">Confirmar Exclusão</v-card-title>
        <v-card-text>Tem certeza que deseja excluir este serviço?</v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="confirmarExclusao.show = false">Cancelar</v-btn>
          <v-btn color="error" @click="confirmarExclusaoConfirmado">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- CABEÇALHO COM BOTÕES -->
    <v-card elevation="4" class="pa-6 mb-6 rounded-lg">
      <v-card-title class="text-h5 font-weight-bold d-flex justify-space-between align-center">
        <div class="d-flex align-center gap-4">
          <v-icon color="primary" size="36">mdi-hammer-wrench</v-icon>
          <span>Gestão de Serviços</span>
        </div>
        <div class="d-flex gap-2">
          <v-btn color="primary" variant="tonal" start-icon="mdi-plus-box" @click="abrirFormularioCategoria">
            Nova Categoria
          </v-btn>
          <v-btn color="primary" variant="tonal" start-icon="mdi-plus" @click="abrirFormularioCriacao">
            Novo Serviço
          </v-btn>
        </div>
      </v-card-title>
      <v-divider />
      <!-- Pesquisa geral por nome de serviço ou categoria -->
      <v-text-field
        v-model="filtroNome"
        label="Pesquisar por nome do serviço ou categoria"
        prepend-inner-icon="mdi-magnify"
        class="mt-4"
        clearable
        density="comfortable"
        rounded
      />
    </v-card>

    <!-- Expansion Panels organizando por categorias -->
    <v-expansion-panels
      multiple
      v-model="categoriasAbertas"
      class="rounded-lg"
      elevation="2"
    >
      <v-expansion-panel
        v-for="(categoria, index) in categoriasFiltradas"
        :key="categoria.id"
        :class="{
          'categoria-aberta': categoriasAbertas.includes(index),
        }"
      >
        <v-expansion-panel-title
          class="categoria-titulo d-flex justify-space-between align-center"
          ripple
        >
          <div class="d-flex align-center gap-4">
            <v-avatar
              size="40"
              color="primary"
              class="categoria-avatar"
              variant="tonal"
            >
              <v-icon size="28" color="white">mdi-folder</v-icon>
            </v-avatar>
            <span class="text-subtitle-1 font-weight-bold">{{ categoria.nome }}</span>
          </div>
          <v-badge
            :content="categoria.servicos.length"
            color="primary"
            class="badge-servicos"
            :size="28"
            max="999"
            variant="tonal"
          >
            <v-icon color="primary" size="24">mdi-briefcase-check</v-icon>
          </v-badge>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-data-table
            :headers="headers"
            :items="categoria.servicos"
            :items-per-page="5"
            class="elevation-1 rounded-lg"
            density="comfortable"
            disable-pagination
            hide-default-footer
          >
            <template #item.preco="{ item }">
              <v-chip
                color="green"
                text-color="white"
                class="font-weight-bold"
                variant="tonal"
                size="small"
              >
                {{ formatarPreco(item.preco) }}
              </v-chip>
            </template>

            <template #item.ativo="{ item }">
              <v-icon :color="item.ativo ? 'green' : 'red'">
                {{ item.ativo ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
            </template>

            <template #item.actions="{ item }">
              <v-tooltip text="Editar">
                <template #activator="{ props }">
                  <v-btn icon color="blue" v-bind="props" @click="abrirEdicao(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>

              <v-tooltip text="Excluir">
                <template #activator="{ props }">
                  <v-btn icon color="error" v-bind="props" @click="confirmarExcluir(item.id)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- DIALOG FORM CRIAÇÃO DE SERVIÇO -->
    <v-dialog
      v-model="mostrarFormCriar"
      max-width="700"
      persistent
      transition="dialog-bottom-transition"
      scrollable
    >
      <v-card class="pa-6 rounded-xl" elevation="12">
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h6 font-weight-bold">Cadastrar Serviço</span>
          <v-btn icon variant="text" @click="mostrarFormCriar = false" aria-label="Fechar">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <FormServicos
          @salvo="aoSalvarServico"
          @fechar="mostrarFormCriar = false"
        />
      </v-card>
    </v-dialog>

    <!-- DIALOG FORM EDIÇÃO DE SERVIÇO -->
    <v-dialog
      v-model="mostrarFormEditar"
      max-width="700"
      persistent
      transition="dialog-bottom-transition"
      scrollable
    >
      <v-card class="pa-6 rounded-xl" elevation="12">
        <EditarServicos
          :servico="servicoEditar"
          @salvo="aoSalvarServico"
          @fechar="mostrarFormEditar = false"
        />
      </v-card>
    </v-dialog>

    <!-- DIALOG FORM CATEGORIA -->
    <v-dialog
      v-model="mostrarFormCategoria"
      max-width="600"
      persistent
      transition="dialog-bottom-transition"
      scrollable
    >
      <v-card class="pa-4 rounded-lg">
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h6 font-weight-bold">Nova Categoria de Serviço</span>
          <v-btn icon variant="text" @click="mostrarFormCategoria = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <FormCategoriaServico @categoriaCadastrada="mostrarFormCategoria = false" />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import FormCategoriaServico from '@/components/FormCategoriaServico.vue'
import FormServicos from '@/components/FormServicos.vue'
import EditarServicos from '@/components/EditarServicos.vue'

axios.defaults.withCredentials = true

export default defineComponent({
  name: 'GerirServicos',
  components: { FormCategoriaServico, FormServicos, EditarServicos },
  setup() {
    const categorias = ref<any[]>([])
    const filtroNome = ref<string>('')

    const mostrarFormCriar = ref(false)
    const mostrarFormEditar = ref(false)
    const mostrarFormCategoria = ref(false)

    // Painéis começam todos fechados
    const categoriasAbertas = ref<number[]>([])

    const snackbar = reactive({
      show: false,
      text: '',
      color: 'success'
    })

    const confirmarExclusao = reactive({
      show: false,
      id: null as number | null
    })

    const servicoEditar = reactive({
      id: null as number | null,
      nome: '',
      descricao: '',
      preco: 0,
      ativo: true
    })

    const headers = [
      { text: 'Nome', value: 'nome' },
      { text: 'Descrição', value: 'descricao' },
      { text: 'Preço (Kz)', value: 'preco' },
      { text: 'Ativo', value: 'ativo' },
      { text: 'Ações', value: 'actions', sortable: false }
    ]

    const categoriasFiltradas = computed(() => {
      if (!filtroNome.value) return categorias.value;

      const termo = filtroNome.value.toLowerCase();

      return categorias.value
        .map(cat => {
          const nomeCategoriaCorresponde = cat.nome.toLowerCase().includes(termo);

          if (nomeCategoriaCorresponde) {
            // Retorna a categoria inteira, sem filtrar os serviços
            return cat;
          } else {
            // Filtra só os serviços cujo nome bate com o termo
            const servicosFiltrados = cat.servicos.filter((s: any) =>
              s.nome.toLowerCase().includes(termo)
            );
            return {
              ...cat,
              servicos: servicosFiltrados
            };
          }
        })
        .filter(cat => cat.servicos.length > 0);
    });

    // Watch para abrir os painéis filtrados automaticamente
    watch(filtroNome, (novoFiltro) => {
      if (!novoFiltro) {
        categoriasAbertas.value = []
      } else {
        // Abrir os painéis das categorias que têm resultados
        categoriasAbertas.value = categoriasFiltradas.value.map((_, idx) => idx)
      }
    })

    const carregarServicos = async () => {
      try {
        const { data } = await axios.get('/lista-servicos')
        categorias.value = data
      } catch (error) {
        mostrarMensagem('Erro ao buscar serviços.', 'error')
        console.error(error)
      }
    }

    const abrirFormularioCriacao = () => {
      mostrarFormCriar.value = true
    }

    const abrirFormularioCategoria = () => {
      mostrarFormCategoria.value = true
    }

    const abrirEdicao = (item: any) => {
      if (!item.id) {
        mostrarMensagem('ID do serviço não encontrado.', 'error')
        return
      }
      Object.assign(servicoEditar, item)
      mostrarFormEditar.value = true
    }

    const aoSalvarServico = async () => {
      mostrarFormCriar.value = false
      mostrarFormEditar.value = false
      await carregarServicos()
      mostrarMensagem('Serviço salvo com sucesso!', 'success')
    }

    const confirmarExcluir = (id: number) => {
      confirmarExclusao.id = id
      confirmarExclusao.show = true
    }

    const confirmarExclusaoConfirmado = async () => {
      if (!confirmarExclusao.id) return
      try {
        await axios.delete(`/salvar-servicos/${confirmarExclusao.id}`)
        await carregarServicos()
        mostrarMensagem('Serviço excluído com sucesso.', 'success')
      } catch (error) {
        console.error(error)
        mostrarMensagem('Erro ao excluir serviço.', 'error')
      } finally {
        confirmarExclusao.show = false
        confirmarExclusao.id = null
      }
    }

    const mostrarMensagem = (texto: string, cor: string) => {
      snackbar.text = texto
      snackbar.color = cor
      snackbar.show = true
    }

    const formatarPreco = (valor: number) => {
      return `Kz ${valor.toLocaleString('pt-AO', {
        style: 'currency',
        currency: 'AOA',
        minimumFractionDigits: 2
      }).replace('AOA', '')}`.trim()
    }

    onMounted(carregarServicos)

    return {
      categorias,
      filtroNome,
      categoriasFiltradas,
      headers,
      mostrarFormCriar,
      mostrarFormEditar,
      mostrarFormCategoria,
      servicoEditar,
      abrirEdicao,
      abrirFormularioCriacao,
      abrirFormularioCategoria,
      aoSalvarServico,
      confirmarExcluir,
      confirmarExclusao,
      confirmarExclusaoConfirmado,
      formatarPreco,
      snackbar,
      categoriasAbertas
    }
  }
})
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
.gap-4 {
  gap: 1rem;
}

/* Categoria título no expansion panel */
.categoria-titulo {
  cursor: pointer;
  user-select: none;
  padding: 0.6rem 1rem;
  transition: background-color 0.3s ease;
  border-radius: 8px;
}
.categoria-titulo:hover {
  background-color: #e3f2fd; /* Azul claro */
}

/* Avatar da categoria */
.categoria-avatar {
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.15);
}

/* Badge para contagem de serviços */
.badge-servicos {
  font-weight: 700;
  font-size: 1.1rem;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  user-select: none;
  transition: background-color 0.3s ease;
}

/* Estilo do painel aberto */
.categoria-aberta > .v-expansion-panel-title {
  background-color: #bbdefb; /* Azul suave */
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  border-radius: 8px;
  font-weight: 600;
  color: #0d47a1;
  transition: all 0.3s ease;
}

/* Ajuste da tabela */
.v-data-table {
  border-radius: 12px;
  overflow: hidden;
}

/* Botões com bordas arredondadas */
.v-btn {
  border-radius: 8px;
}

/* Campos de texto com borda arredondada */
.v-text-field input {
  border-radius: 8px !important;
}

/* Textos mais visíveis */
.text-subtitle-1 {
  font-weight: 600;
}
</style>
