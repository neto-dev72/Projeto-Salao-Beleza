<template>
  <v-card outlined class="pa-6" elevation="3" max-width="700" mx="auto" style="background: #fafafa;">
    <!-- Nome do salão destacado -->
    <v-row justify="center" class="mb-4">
      <v-col cols="12" class="text-center">
        <h1 class="font-weight-black display-1" style="color: #4a148c;">
          {{ dados.salao?.nome || 'Nome do Salão' }}
        </h1>
        <v-divider class="mx-auto my-2" style="width: 60px; border-top: 4px solid #7b1fa2;"></v-divider>
      </v-col>
    </v-row>

    <!-- Cabeçalho recibo -->
    <v-row>
      <v-col cols="6">
        <div>
          <strong class="subtitle-1">Recibo de Venda #{{ dados.venda.id }}</strong>
        </div>
      </v-col>
      <v-col cols="6" class="text-right">
        <div>
          <strong class="subtitle-1">Data: </strong> {{ formatarData(dados.venda.dataVenda) }}
        </div>
      </v-col>
    </v-row>

    <v-divider class="my-4"></v-divider>

    <!-- Cliente -->
    <v-row>
      <v-col cols="12">
        <h3 class="font-weight-medium mb-2">Cliente</h3>
        <v-list dense class="pa-0">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>Nome:</strong> {{ dados.cliente.nome || 'Não informado' }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>Telefone:</strong> {{ dados.cliente.telefone || 'Não informado' }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>Email:</strong> {{ dados.cliente.email || 'Não informado' }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>

    <v-divider class="my-4"></v-divider>

    <!-- Serviços -->
    <v-row>
      <v-col cols="12">
        <h3 class="font-weight-medium mb-2">Serviços</h3>
        <v-list dense>
          <v-list-item v-for="(servico, index) in dados.servicos" :key="index" class="py-1">
            <v-list-item-content>
              <v-list-item-title class="font-weight-bold">
                {{ servico.nome }}
                <span class="grey--text text--darken-1" style="font-weight: normal;">
                  - Kz {{ formatarValor(servico.preco) }}
                </span>
              </v-list-item-title>
              <v-list-item-subtitle class="text--secondary" style="font-size: 0.875rem;">
                Funcionário: {{ servico.funcionario?.nome || 'Não informado' }} — 
                Função: {{ servico.funcionario?.funcao || 'Não informado' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="dados.servicos.length === 0">
            <v-list-item-content>
              <v-list-item-title>Sem serviços</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>

    <v-divider class="my-4"></v-divider>

    <!-- Produtos -->
    <v-row>
      <v-col cols="12">
        <h3 class="font-weight-medium mb-2">Produtos</h3>
        <v-list dense>
          <v-list-item v-for="(produto, index) in dados.produtos" :key="index" class="py-1">
            <v-list-item-content>
              <v-list-item-title class="font-weight-bold">
                {{ produto.nome }}
                <span class="grey--text text--darken-1" style="font-weight: normal;">
                  - Kz {{ formatarValor(produto.preco) }} (Qtd: {{ produto.quantidade }})
                </span>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="dados.produtos.length === 0">
            <v-list-item-content>
              <v-list-item-title>Sem produtos</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>

    <v-divider class="my-4"></v-divider>

    <!-- Pagamento e total -->
    <v-row class="mb-4">
      <v-col cols="6">
        <strong>Método de Pagamento:</strong> {{ dados.metodoPagamento || 'Não informado' }}
      </v-col>
      <v-col cols="6" class="text-right">
        <strong>Total:</strong> Kz {{ formatarValor(dados.venda.valorTotal) }}
      </v-col>
    </v-row>

    <!-- Observações -->
    <v-row v-if="dados.venda.observacoes" class="mb-4">
      <v-col cols="12">
        <strong>Observações:</strong>
        <p class="ml-2" style="white-space: pre-wrap;">{{ dados.venda.observacoes }}</p>
      </v-col>
    </v-row>

    <!-- Mensagem especial para o cliente -->
    <v-row justify="center" class="my-6">
      <v-col cols="12" md="10" class="text-center">
        <v-sheet
          elevation="2"
          color="#e1bee7"
          rounded
          class="pa-4"
          style="font-style: italic; font-weight: 600; color: #4a148c;"
        >
          Obrigado por escolher nosso salão! Sua beleza é nossa inspiração. Esperamos vê-lo(a) novamente em breve!
        </v-sheet>
      </v-col>
    </v-row>

    <!-- Rodapé com endereço e telefone do salão -->
    <v-divider></v-divider>
    <v-row class="mt-3" justify="center" align="center" style="font-size: 0.875rem; color: #555;">
      <v-col cols="12" class="text-center">
        <div>
          <span><strong>Endereço:</strong> {{ dados.salao?.endereco || 'Não informado' }}</span>
          <span class="mx-4">|</span>
          <span><strong>Telefone:</strong> {{ dados.salao?.telefone || 'Não informado' }}</span>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
  dados: {
    salao?: {
      nome?: string
      endereco?: string
      telefone?: string
    }
    venda: {
      id: number
      dataVenda: string
      valorTotal: number | string
      observacoes?: string | null
    }
    cliente: {
      nome: string
      telefone?: string | null
      email?: string | null
    }
    servicos: Array<{
      nome: string
      preco: number | string
      funcionario?: {
        nome: string
        funcao: string
      } | null
    }>
    produtos: Array<{
      nome: string
      preco: number | string
      quantidade: number
    }>
    metodoPagamento: string
  }
}>()

function formatarData(dataISO: string) {
  if (!dataISO) return 'Não informado'
  const data = new Date(dataISO)
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const ano = data.getFullYear()
  return `${dia}/${mes}/${ano}`
}

function formatarValor(valor: number | string) {
  if (typeof valor === 'string') valor = parseFloat(valor)
  if (isNaN(valor)) return '0,00'
  return valor.toFixed(2).replace('.', ',')
}
</script>

<style scoped>
/* Estilos opcionais */
</style>
