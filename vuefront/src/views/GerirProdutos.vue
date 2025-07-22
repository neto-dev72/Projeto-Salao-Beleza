<template>
  <v-container class="py-10">
    <!-- Snackbar de feedback -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top right">
      {{ snackbar.text }}
    </v-snackbar>

    <!-- Diálogo de confirmação de exclusão -->
    <v-dialog v-model="confirmarExclusao.show" max-width="400">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">Confirmar Exclusão</v-card-title>
        <v-card-text>Tem certeza que deseja excluir este produto?</v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="confirmarExclusao.show = false">Cancelar</v-btn>
          <v-btn color="error" @click="confirmarExclusaoConfirmado">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Título e botão de novo produto -->
    <v-card elevation="4" class="pa-6">
      <v-card-title class="text-h5 font-weight-bold d-flex justify-space-between align-center">
        <div class="d-flex align-center gap-4">
          <v-icon color="primary" size="36">mdi-package-variant-closed</v-icon>
          <span>Gestão de Produtos</span>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="abrirFormularioCriacao">
          Novo Produto
        </v-btn>
      </v-card-title>

      <v-divider class="my-4" />

      <!-- Campo de busca estilizado -->
      <v-text-field
        v-model="filtroNome"
        label="Pesquisar produto pelo nome"
        variant="solo-filled"
        class="mb-6 rounded-lg shadow-sm"
        prepend-inner-icon="mdi-magnify"
        hide-details
        color="primary"
        density="comfortable"
        clearable
        style="max-width: 400px;"
      />

      <!-- Tabela de produtos -->
      <v-data-table
        :headers="headers"
        :items="produtosFiltrados"
        :items-per-page="10"
        class="elevation-1"
        density="comfortable"
      >
        <template #item.precoCompra="{ item }">
          <v-chip color="blue" text-color="white" class="font-weight-bold">
            {{ formatarPreco(item.precoCompra) }}
          </v-chip>
        </template>

        <template #item.precoVenda="{ item }">
          <v-chip color="green" text-color="white" class="font-weight-bold">
            {{ formatarPreco(item.precoVenda) }}
          </v-chip>
        </template>

        <template #item.ativo="{ item }">
          <v-icon :color="item.ativo ? 'green' : 'red'">
            {{ item.ativo ? 'mdi-check-circle' : 'mdi-close-circle' }}
          </v-icon>
        </template>

        <template #item.quantidade="{ item }">
          <v-chip v-if="item.quantidade === 0" color="red" text-color="white" class="font-weight-bold">
            Sem Estoque
          </v-chip>
          <v-chip v-else-if="item.quantidade < 5" color="orange" text-color="white" class="font-weight-bold">
            Estoque Crítico ({{ item.quantidade }} em estoque)
          </v-chip>
          <v-chip v-else color="green" text-color="white" class="font-weight-bold">
            {{ item.quantidade }} em Estoque
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-tooltip text="Editar">
            <template #activator="{ props }">
              <v-btn icon="mdi-pencil" v-bind="props" color="blue" @click="abrirEdicao(item)" />
            </template>
          </v-tooltip>

          <v-tooltip text="Excluir">
            <template #activator="{ props }">
              <v-btn icon="mdi-delete" v-bind="props" color="error" @click="confirmarExcluir(item.id)" />
            </template>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal com formulário de produto -->
    <v-dialog v-model="mostrarForm" max-width="700" persistent transition="dialog-bottom-transition">
      <v-card class="pa-6 rounded-xl" elevation="12">
        <v-card-title class="d-flex justify-space-between align-center mb-4">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-2" size="32">
              {{ modoEdicao ? 'mdi-pencil-box' : 'mdi-plus-box' }}
            </v-icon>
            <span class="text-h6 font-weight-bold">
              {{ modoEdicao ? 'Editar Produto' : 'Cadastrar Novo Produto' }}
            </span>
          </div>
          <v-btn icon variant="text" @click="mostrarForm = false">
            <v-icon color="grey">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider class="mb-4" />

        <v-card-text>
          <v-form @submit.prevent="salvarProduto">
            <v-row dense class="px-2">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="produto.nome"
                  label="Nome do Produto"
                  prepend-inner-icon="mdi-format-title"
                  required
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="produto.precoCompra"
                  label="Preço de Compra (Kz)"
                  type="number"
                  min="0"
                  step="0.01"
                  prepend-inner-icon="mdi-currency-kzt"
                  required
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="produto.precoVenda"
                  label="Preço de Venda (Kz)"
                  type="number"
                  min="0"
                  step="0.01"
                  prepend-inner-icon="mdi-currency-kzt"
                  required
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="produto.quantidade"
                  label="Quantidade em Stock"
                  type="number"
                  min="0"
                  prepend-inner-icon="mdi-counter"
                  required
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="produto.categoria"
                  label="Categoria"
                  prepend-inner-icon="mdi-tag-outline"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="produto.descricao"
                  label="Descrição do Produto"
                  prepend-inner-icon="mdi-text-box-outline"
                  auto-grow
                  rows="3"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="produto.ativo"
                  label="Produto Ativo"
                  color="success"
                  inset
                >
                  <template #thumb>
                    <v-icon>{{ produto.ativo ? 'mdi-check' : 'mdi-close' }}</v-icon>
                  </template>
                </v-switch>
              </v-col>

              <v-col cols="12" class="mt-4">
                <v-btn
                  type="submit"
                  block
                  color="primary"
                  class="rounded-xl text-white text-subtitle-1 font-weight-bold"
                  prepend-icon="mdi-content-save"
                >
                  {{ modoEdicao ? 'Salvar Alterações' : 'Cadastrar Produto' }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'

axios.defaults.withCredentials = true

export default defineComponent({
  name: 'GerirProdutos',
  setup() {
    const produtos = ref<any[]>([])
    const filtroNome = ref<string>('')

    const mostrarForm = ref(false)
    const modoEdicao = ref(false)
    const snackbar = reactive({
      show: false,
      text: '',
      color: 'success'
    })
    const confirmarExclusao = reactive({
      show: false,
      id: null as number | null
    })

    const produto = reactive({
      id: null as number | null,
      nome: '',
      descricao: '',
      precoCompra: 0,
      precoVenda: 0,
      quantidade: 0,
      categoria: '',
      ativo: true
    })

    const headers = [
      { text: 'Nome', value: 'nome' },
      { text: 'Categoria', value: 'categoria' },
      { text: 'Preço Compra', value: 'precoCompra' },
      { text: 'Preço Venda', value: 'precoVenda' },
      { text: 'Quantidade', value: 'quantidade' },
      { text: 'Ativo', value: 'ativo' },
      { text: 'Ações', value: 'actions', sortable: false }
    ]

    const produtosFiltrados = computed(() => {
      if (!filtroNome.value) return produtos.value
      return produtos.value.filter(p =>
        p.nome.toLowerCase().includes(filtroNome.value.toLowerCase())
      )
    })

    const carregarProdutos = async () => {
      try {
        const { data } = await axios.get('/lista-produtos')
        produtos.value = data
      } catch (error) {
        mostrarMensagem('Erro ao buscar produtos.', 'error')
        console.error(error)
      }
    }

    const abrirFormularioCriacao = () => {
      modoEdicao.value = false
      Object.assign(produto, {
        id: null,
        nome: '',
        descricao: '',
        precoCompra: 0,
        precoVenda: 0,
        quantidade: 0,
        categoria: '',
        ativo: true
      })
      mostrarForm.value = true
    }

    const abrirEdicao = (item: any) => {
      modoEdicao.value = true
      Object.assign(produto, { ...item })
      mostrarForm.value = true
    }

    const salvarProduto = async () => {
      try {
        if (modoEdicao.value && produto.id) {
          await axios.patch(`/produtos/${produto.id}`, produto)
          mostrarMensagem('Produto atualizado com sucesso!', 'success')
        } else {
          await axios.post('/cadastrar-produtos', produto)
          mostrarMensagem('Produto cadastrado com sucesso!', 'success')
        }

        mostrarForm.value = false
        await carregarProdutos()
      } catch (err: any) {
        console.error(err)
        mostrarMensagem(err.response?.data?.erro || 'Erro ao salvar produto.', 'error')
      }
    }

    const confirmarExcluir = (id: number) => {
      confirmarExclusao.id = id
      confirmarExclusao.show = true
    }

    const confirmarExclusaoConfirmado = async () => {
      if (!confirmarExclusao.id) return
      try {
        await axios.delete(`/produtos/${confirmarExclusao.id}`)
        produtos.value = produtos.value.filter((p: any) => p.id !== confirmarExclusao.id)
        mostrarMensagem('Produto excluído com sucesso.', 'success')
      } catch (error) {
        console.error(error)
        mostrarMensagem('Erro ao excluir produto.', 'error')
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

    onMounted(carregarProdutos)

    return {
      produtos,
      filtroNome,
      produtosFiltrados,
      headers,
      mostrarForm,
      modoEdicao,
      produto,
      abrirEdicao,
      abrirFormularioCriacao,
      salvarProduto,
      confirmarExcluir,
      confirmarExclusao,
      confirmarExclusaoConfirmado,
      snackbar,
      formatarPreco
    }
  }
})
</script>

<style scoped>
.gap-4 {
  gap: 1rem;
}
</style>
