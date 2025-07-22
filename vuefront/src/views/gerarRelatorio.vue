<template>
  <v-container class="py-12">
    <v-card
      class="pa-10 mx-auto"
      max-width="1000"
      elevation="8"
      rounded="2xl"
      style="background: linear-gradient(to bottom right, #F3F8FE, #D8E3F8)"
    >
      <!-- CABEÇALHO -->
      <div class="text-center mb-10">
        <v-icon size="48" color="blue-grey" class="mb-3">mdi-chart-bar</v-icon>
        <h2 class="text-h4 font-weight-bold mb-2">Relatório de Serviços e Produtos</h2>
        <p class="text-body-1 text-blue-grey">
          Visualize o desempenho dos serviços e produtos prestados com filtros inteligentes e gráficos resumidos.
        </p>
      </div>

      <!-- FILTROS -->
      <v-row dense class="mb-8">
        <v-col cols="12">
          <h3 class="text-subtitle-1 font-weight-bold mb-1">Filtros do Relatório</h3>
          <p class="text-body-2 text-blue-grey">
            Escolha o período, os serviços e produtos desejados para gerar um relatório personalizado.
          </p>
        </v-col>

        <v-col cols="12" md="4">
          <v-select
            v-model="periodo"
            :items="periodos"
            label="Período"
            variant="outlined"
            density="comfortable"
            clearable
            prepend-inner-icon="mdi-calendar-range"
            color="light-blue"
          />
        </v-col>

        <!-- Seleção de Serviços -->
        <v-col cols="12" md="8">
          <v-select
            v-model="servicoIds"
            :items="servicos"
            item-title="nome"
            item-value="id"
            label="Serviços"
            multiple
            clearable
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-scissors-cutting"
            color="light-blue"
          >
            <template #append>
              <v-tooltip text="Selecionar todos os serviços">
                <template #activator="{ props }">
                  <v-btn icon v-bind="props" @click="selecionarTodosServicos" color="light-blue">
                    <v-icon>mdi-select-all</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </template>
          </v-select>
        </v-col>

        <!-- Seleção de Produtos -->
        <v-col cols="12" md="8">
          <v-select
            v-model="produtoIds"
            :items="produtos"
            item-title="nome"
            item-value="id"
            label="Produtos"
            multiple
            clearable
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-cube"
            color="purple-lighten-4"
          >
            <template #append>
              <v-tooltip text="Selecionar todos os produtos">
                <template #activator="{ props }">
                  <v-btn icon v-bind="props" @click="selecionarTodosProdutos" color="purple-lighten-4">
                    <v-icon>mdi-select-all</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </template>
          </v-select>
        </v-col>

        <v-col cols="12" class="d-flex align-center">
          <v-checkbox
            v-model="incluirDespesas"
            label="Incluir despesas no relatório"
            density="comfortable"
            prepend-icon="mdi-cash-refund"
            color="blue"
          />
        </v-col>

        <v-col cols="12">
          <v-btn
            block
            size="large"
            color="light-blue"
            class="text-white mt-4"
            @click="gerarRelatorio"
            :disabled="!periodo || (servicoIds.length === 0 && produtoIds.length === 0)"
            rounded="xl"
            elevation="2"
          >
            <v-icon left>mdi-file-chart</v-icon>
            Gerar Relatório
          </v-btn>
        </v-col>
      </v-row>

      <!-- RESULTADO DO RELATÓRIO -->
      <div v-if="resultado && Object.keys(resultado).length">
        <v-divider class="mb-8"></v-divider>

        <!-- Botões de download -->
        <div class="text-right mb-4 d-flex justify-end gap-4">
          <v-btn color="light-blue" @click="baixarComoImagem" rounded="xl">
            <v-icon left>mdi-image</v-icon>
            PNG
          </v-btn>
          <v-btn color="purple-lighten-4" @click="baixarPDF" class="text-white" rounded="xl">
            <v-icon left>mdi-file-pdf-box</v-icon>
            PDF
          </v-btn>
        </div>

        <!-- Conteúdo capturável -->
        <div ref="relatorioRef" class="pa-4 bg-white rounded-xl">
          <!-- RESUMO -->
          <v-sheet color="blue-grey-lighten-5" class="pa-6 mb-6" rounded="xl" elevation="1">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">
              <v-icon left class="mr-2">mdi-calendar</v-icon>
              Resumo do Período
            </h3>
            <p class="text-body-2">
              Este resumo apresenta o intervalo de tempo selecionado para o relatório atual.
            </p>
            <p class="text-body-2 mt-2">
              <strong>De:</strong> {{ formatarData(resultado.dataInicio) }} <br>
              <strong>Até:</strong> {{ formatarData(resultado.dataFim) }}
            </p>
          </v-sheet>

          <!-- DETALHES POR SERVIÇO -->
          <div class="mb-6" v-if="resultado.detalhesServicos && resultado.detalhesServicos.length">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Desempenho por Serviço</h3>
            <p class="text-body-2 text-blue-grey mb-4">
              Veja o desempenho individual de cada serviço prestado no período selecionado.
            </p>

            <v-row dense>
              <v-col v-for="servico in resultado.detalhesServicos" :key="'servico-' + servico.id" cols="12" md="6">
                <v-card class="pa-4 mb-4" elevation="3" rounded="xl">
                  <div class="d-flex justify-space-between align-center mb-3">
                    <h4 class="text-subtitle-1 font-weight-medium">{{ servico.nome }}</h4>
                    <v-icon color="light-blue">mdi-scissors-cutting</v-icon>
                  </div>
                  <v-divider class="mb-3"></v-divider>
                  <p><strong>Total:</strong> {{ formatarKz(servico.total) }}</p>
                  <p><strong>Quantidade:</strong> {{ servico.quantidade }} {{ servico.quantidade === 1 ? 'vez' : 'vezes' }}</p>
                  <p><strong>Média:</strong> {{ formatarKz(servico.media) }}</p>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- DETALHES POR PRODUTO -->
          <div class="mb-6" v-if="resultado.detalhesProdutos && resultado.detalhesProdutos.length">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Desempenho por Produto</h3>
            <p class="text-body-2 text-blue-grey mb-4">
              Veja o desempenho individual de cada produto vendido no período selecionado.
            </p>

            <v-row dense>
              <v-col v-for="produto in resultado.detalhesProdutos" :key="'produto-' + produto.id" cols="12" md="6">
                <v-card class="pa-4 mb-4" elevation="3" rounded="xl">
                  <div class="d-flex justify-space-between align-center mb-3">
                    <h4 class="text-subtitle-1 font-weight-medium">{{ produto.nome }}</h4>
                    <v-icon color="purple-lighten-4">mdi-cube</v-icon>
                  </div>
                  <v-divider class="mb-3"></v-divider>
                  <p><strong>Total:</strong> {{ formatarKz(produto.total) }}</p>
                  <p><strong>Quantidade:</strong> {{ produto.quantidade }} {{ produto.quantidade === 1 ? 'unidade' : 'unidades' }}</p>
                  <p><strong>Média:</strong> {{ formatarKz(produto.media) }}</p>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- TOTAIS -->
          <div class="mt-8">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Totais e Saldo</h3>
            <p class="text-body-2 text-blue-grey mb-4">
              Esta seção mostra o valor total vendido, número de serviços e produtos realizados e, se escolhido, os custos com despesas.
            </p>
          </div>
          <v-row>
            <v-col cols="12" md="6">
              <v-alert
                type="success"
                variant="tonal"
                rounded="xl"
                border="start"
                border-color="green"
                class="text-body-2"
              >
                <v-icon class="mr-2">mdi-cash-multiple</v-icon>
                <strong>Total vendido:</strong> {{ formatarKz(resultado.totalVendido) }}<br />
                <strong>Total de serviços vendidos:</strong> {{ resultado.totalServicosVendidos }}<br />
                <strong>Total de produtos vendidos:</strong> {{ resultado.totalProdutosVendidos || 0 }}
              </v-alert>
            </v-col>

            <v-col cols="12" md="6" v-if="incluirDespesas">
              <v-alert
                type="info"
                variant="tonal"
                rounded="xl"
                border="start"
                border-color="blue"
                class="text-body-2"
              >
                <v-icon class="mr-2">mdi-cash-refund</v-icon>
                <strong>Total despesas:</strong> {{ formatarKz(resultado.totalDespesas) }}<br />
                <strong>Saldo:</strong> {{ formatarKz(resultado.saldo) }}
              </v-alert>
            </v-col>
          </v-row>
        </div>
      </div>

      <!-- SEM RESULTADOS -->
      <v-alert
        v-else-if="resultado !== null"
        type="warning"
        class="mt-10"
        border="start"
        colored-border
        variant="tonal"
        icon="mdi-alert-circle-outline"
      >
        Nenhum dado encontrado para os filtros selecionados.
      </v-alert>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import html2canvas from 'html2canvas'
import html2pdf from 'html2pdf.js'

const periodos = ['dia', 'semana', 'mes', 'trimestre', 'ano']
const periodo = ref('')
const servicoIds = ref<number[]>([])
const produtoIds = ref<number[]>([])
const incluirDespesas = ref(true)
const servicos = ref<any[]>([])
const produtos = ref<any[]>([])
const resultado = ref<null | {
  detalhesServicos: {
    id: number,
    nome: string,
    total: number,
    quantidade: number,
    media: number
  }[],

  detalhesProdutos: {
    id: number,
    nome: string,
    total: number,
    quantidade: number,
    media: number
  }[],

  totalVendido: number,
  totalDespesas: number,
  saldo: number,
  totalServicosVendidos: number,
  totalProdutosVendidos: number,
  dataInicio: string,
  dataFim: string
}>(null)

const relatorioRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  const resServicos = await axios.get('/todos-servicos')
  servicos.value = resServicos.data

  const resProdutos = await axios.get('/todos-produtos')
  produtos.value = resProdutos.data
})

const selecionarTodosServicos = () => {
  servicoIds.value = servicos.value.map(s => s.id)
}

const selecionarTodosProdutos = () => {
  produtoIds.value = produtos.value.map(p => p.id)
}

const gerarRelatorio = async () => {
  try {
    const res = await axios.get('/relatorio-servico', {
      params: {
        servicoIds: servicoIds.value,
        produtoIds: produtoIds.value,
        periodo: periodo.value,
        incluirDespesas: incluirDespesas.value
      },
      paramsSerializer: params => {
        const query = new URLSearchParams()
        query.append('periodo', params.periodo)
        params.servicoIds.forEach((id: number) => {
          query.append('servicoIds', id.toString())
        })
        params.produtoIds.forEach((id: number) => {
          query.append('produtoIds', id.toString())
        })
        if (params.incluirDespesas !== undefined) {
          query.append('incluirDespesas', params.incluirDespesas.toString())
        }
        return query.toString()
      }
    })

    if ((!res.data.detalhesServicos?.length && !res.data.detalhesProdutos?.length) && res.data.totalVendido === 0) {
      resultado.value = {}
    } else {
      resultado.value = res.data
    }
  } catch (err) {
    console.error('Erro ao gerar relatório:', err)
    resultado.value = null
  }
}

const baixarComoImagem = async () => {
  if (!relatorioRef.value) return
  const canvas = await html2canvas(relatorioRef.value)
  canvas.toBlob(blob => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-${new Date().toISOString()}.png`
    link.click()
    URL.revokeObjectURL(url)
  })
}

const baixarPDF = () => {
  if (!relatorioRef.value) return
  const opt = {
    margin:       0.5,
    filename:     `relatorio-${new Date().toISOString()}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  }
  html2pdf().set(opt).from(relatorioRef.value).save()
}

const formatarKz = (valor: number) => {
  return valor.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })
}

const formatarData = (data: string) => {
  return new Date(data).toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<style scoped>
/* Estilos adicionais */
</style>
