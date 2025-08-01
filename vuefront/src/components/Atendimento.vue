<template>
  <v-dialog v-model="modelValue" max-width="700" transition="dialog-bottom-transition">
    <v-card elevation="24" class="pa-6" outlined>
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <span class="headline font-weight-bold">Atendimento para</span>
          <strong class="display-2">{{ cliente?.nome }}</strong>
        </div>
        <v-btn icon color="error" @click="fechar">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <!-- Seleção do Funcionário -->
        <v-subheader class="font-weight-bold mt-4">Profissional Responsável pelo Serviço</v-subheader>
        <v-select
          v-model="funcionarioSelecionado"
          :items="funcionarios"
          item-title="nome"
          item-value="id"
          label="Escolha o Funcionário"
          dense
          return-object
          clearable
          class="mb-6"
          :menu-props="{ maxHeight: '400' }"
        />

        <!-- Seleção de serviços -->
        <v-subheader class="font-weight-bold mt-4">Seleção de Serviços</v-subheader>
        <v-autocomplete
          v-model="servicosSelecionados"
          :items="servicos"
          item-title="nome"
          item-value="id"
          label="Escolha os serviços"
          multiple
          chip
          dense
          return-object
          clearable
          class="mb-6"
          :menu-props="{ maxHeight: '400' }"
          item-disabled="desabilitarItem"
          :search-input.sync="searchQuery"
          :filter="filterServices"
          no-data-text="Nenhum serviço encontrado"
        />

        <!-- Seleção de produtos -->
        <v-subheader class="font-weight-bold mt-4">Seleção de Produtos</v-subheader>
        <v-select
          v-model="produtosSelecionados"
          :items="produtos"
          item-title="nome"
          item-value="id"
          label="Escolha os produtos"
          multiple
          chip
          dense
          return-object
          class="mb-6"
          :menu-props="{ maxHeight: '400' }"
        />

        <!-- Data do atendimento -->
        <v-text-field
          v-model="dataAgenda"
          label="Data do Atendimento"
          type="date"
          prepend-inner-icon="mdi-calendar"
          outlined
          class="mt-4"
          color="primary"
          dense
        />
        <v-btn
          small
          color="primary"
          @click="marcarHoje"
          class="mt-2"
        >
          Marcar para Hoje
        </v-btn>

        <!-- Observações -->
        <v-textarea
          v-model="observacoesAtendimento"
          label="Observações"
          rows="3"
          outlined
          color="primary"
          class="mt-4"
        />

        <!-- Método de Pagamento -->
        <v-select
          v-model="metodoPagamentoId"
          :items="metodosPagamento"
          item-title="tipo"
          item-value="id"
          label="Método de Pagamento"
          prepend-inner-icon="mdi-credit-card-outline"
          outlined
          color="primary"
          class="mt-4"
          clearable
        />

        <!-- Valor Total -->
        <v-divider class="my-4"></v-divider>
        <v-subheader class="font-weight-bold">Valor Total</v-subheader>
        <div class="display-2 font-weight-bold text-center text-primary">
          {{ formatarValor(valorTotal) }}
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer />
        <v-btn color="grey darken-1" @click="fechar" rounded>
          Cancelar
        </v-btn>
        <v-btn
          color="success"
          :disabled="!servicosSelecionados.length && !produtosSelecionados.length"
          @click="finalizarAtendimento"
          rounded
        >
          Finalizar Atendimento
        </v-btn>
        <v-btn
          color="secondary"
          :disabled="!servicosSelecionados.length && !produtosSelecionados.length"
          @click="agendarClienteExistente"
          rounded
        >
          Agendar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modal de sucesso adicionado -->
  <v-dialog v-model="modalSucesso" max-width="400" persistent>
    <v-card class="pa-6" outlined>
      <v-card-text class="text-center">
        <v-icon color="green" size="72">mdi-check-circle</v-icon>
        <h3 class="headline font-weight-bold mt-4">Sucesso!</h3>
        <p class="subtitle-1 mt-2">Operação realizada com sucesso. Muito obrigado por confiar no nosso serviço!</p>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="green" dark rounded @click="modalSucesso = false">
          Fechar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import axios from 'axios'

interface Servico {
  id: number
  nome: string
  preco: number
}

interface Produto {
  id: number
  nome: string
  precoVenda: number
}

interface MetodoPagamento {
  id: number
  tipo: string
}

interface Cliente {
  id: number
  nome: string
}

interface Funcionario {
  id: number
  nome: string
}

export default defineComponent({
  name: 'Atendimento',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    cliente: {
      type: Object as () => Cliente | null,
      default: null
    }
  },
  emits: ['update:modelValue', 'finalizado'],
  setup(props, { emit }) {
    const servicos = ref<Servico[]>([])
    const servicosSelecionados = ref<Servico[]>([])
    const produtos = ref<Produto[]>([])
    const produtosSelecionados = ref<Produto[]>([])
    const funcionarios = ref<Funcionario[]>([])
    const funcionarioSelecionado = ref<Funcionario | null>(null)
    const observacoesAtendimento = ref('')
    const dataAgenda = ref<string | null>(null)
    const valorTotal = ref<number | string>(0)
    const metodoPagamentoId = ref<number | null>(null)
    const metodosPagamento = ref<MetodoPagamento[]>([])

    const searchQuery = ref('')

    // Novo estado para controlar o modal de sucesso
    const modalSucesso = ref(false)

    const carregarFuncionarios = async () => {
      try {
        const { data } = await axios.get('/funcionarios')
        funcionarios.value = data
      } catch (e) {
        console.error(e)
        alert('Erro ao buscar funcionários.')
      }
    }

    const carregarServicos = async () => {
      try {
        const { data } = await axios.get('/todos-servicos')
        servicos.value = data
      } catch (e) {
        console.error(e)
        alert('Erro ao buscar serviços.')
      }
    }

    const carregarProdutos = async () => {
      try {
        const { data } = await axios.get('/todos-produtos')
        produtos.value = data
      } catch (e) {
        console.error(e)
        alert('Erro ao buscar produtos.')
      }
    }

    const carregarMetodosPagamento = async () => {
      try {
        const { data } = await axios.get('/todos-pagamento')
        metodosPagamento.value = data
      } catch (e) {
        console.error(e)
        alert('Erro ao carregar métodos de pagamento.')
      }
    }

    watch(() => props.modelValue, (novo) => {
      if (novo) {
        servicosSelecionados.value = []
        produtosSelecionados.value = []
        observacoesAtendimento.value = ''
        dataAgenda.value = null
        metodoPagamentoId.value = null
        valorTotal.value = 0
        carregarFuncionarios()
        carregarServicos()
        carregarProdutos()
        carregarMetodosPagamento()
      }
    })

    watch([servicosSelecionados, produtosSelecionados], () => {
      calcularValorTotal()
    })

    const calcularValorTotal = () => {
      let total = 0

      servicosSelecionados.value.forEach(servico => {
        total += Number(servico.preco)
      })

      produtosSelecionados.value.forEach(produto => {
        total += Number(produto.precoVenda)
      })

      valorTotal.value = total
    }

    const formatarValor = (valor: number) => {
      return `${valor.toFixed(2)} Kz`
    }

    const fechar = () => {
      emit('update:modelValue', false)
      servicosSelecionados.value = []
      produtosSelecionados.value = []
      observacoesAtendimento.value = ''
      dataAgenda.value = null
      metodoPagamentoId.value = null
      valorTotal.value = 0
    }

    const finalizarAtendimento = async () => {
      if (!props.cliente || (servicosSelecionados.value.length === 0 && produtosSelecionados.value.length === 0))
        return alert('Selecione ao menos um serviço ou produto.')

      try {
        const resp = await axios.post('/registra-venda-avulsa', {
          clienteId: props.cliente.id,
          funcionarioId: funcionarioSelecionado.value?.id || null,
          servicos: servicosSelecionados.value.map(s => ({ id: s.id, preco: s.preco.toString() })),
          produtos: produtosSelecionados.value.map(p => ({ id: p.id, preco: p.precoVenda.toString() })),
          observacoes: observacoesAtendimento.value || '',
          dataVenda: dataAgenda.value,
          metodoPagamentoId: metodoPagamentoId.value
        })
        // Mostrar modal de sucesso
        modalSucesso.value = true
        fechar()
        emit('finalizado')
      } catch (e: any) {
        console.error('Erro ao registrar venda:', e)
        alert(`Erro ao registrar venda: ${e.response?.data?.erro || e.message || e}`)
      }
    }

    const agendarClienteExistente = async () => {
      if (!props.cliente || !dataAgenda.value)
        return alert('Selecione uma data para o agendamento.')

      try {
        await axios.post('/agendar-cliente-existente', {
          clienteId: props.cliente.id,
          dataAgendamento: dataAgenda.value,
          observacoes: observacoesAtendimento.value,
          servicosIds: servicosSelecionados.value.map(s => s.id),
          produtosAgendados: produtosSelecionados.value.map(p => ({
            id: p.id,
            quantidade: 1
          })),
          metodoPagamentoId: metodoPagamentoId.value,
          funcionarioId: funcionarioSelecionado.value?.id || null
        })
        // Mostrar modal de sucesso
        modalSucesso.value = true
        fechar()
      } catch (e) {
        console.error(e)
        alert('Erro ao agendar cliente.')
      }
    }

    const marcarHoje = () => {
      const hoje = new Date().toISOString().split('T')[0]
      dataAgenda.value = hoje
    }

    // Filtro para o serviço
    const filterServices = (item: Servico, query: string) => {
      if (!query) return true
      return item.nome.toLowerCase().includes(query.toLowerCase())
    }

    return {
      servicos,
      servicosSelecionados,
      produtos,
      produtosSelecionados,
      funcionarios,
      funcionarioSelecionado,
      observacoesAtendimento,
      dataAgenda,
      valorTotal,
      metodoPagamentoId,
      metodosPagamento,
      searchQuery,
      calcularValorTotal,
      finalizarAtendimento,
      agendarClienteExistente,
      fechar,
      marcarHoje,
      formatarValor,
      filterServices,

      // Modal sucesso
      modalSucesso
    }
  }
})
</script>

<style scoped>
/* ...seu estilo... */
</style>
