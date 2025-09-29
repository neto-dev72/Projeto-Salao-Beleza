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

    <!-- Botões de exportação -->
    <v-row justify="end" class="mb-4">
      <v-col cols="auto">
        <v-btn color="purple lighten-1" class="text-white" rounded @click="exportarPDF">
          <v-icon left>mdi-file-pdf-box</v-icon> PDF
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn color="green lighten-1" class="text-white" rounded @click="exportarCSV">
          <v-icon left>mdi-file-delimited</v-icon> CSV
        </v-btn>
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

    <!-- Mensagem especial -->
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

    <!-- Rodapé -->
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
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const props = defineProps<{
  dados: {
    salao?: { nome?: string; endereco?: string; telefone?: string }
    venda: { id: number; dataVenda: string; valorTotal: number | string; observacoes?: string | null }
    cliente: { nome: string; telefone?: string | null; email?: string | null }
    servicos: Array<{ nome: string; preco: number | string; funcionario?: { nome: string; funcao: string } | null }>
    produtos: Array<{ nome: string; preco: number | string; quantidade: number }>
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

// EXPORTAR PDF COM DETALHES DO SALÃO E AGRADECIMENTO
const exportarPDF = () => {
  const doc = new jsPDF()

  // Detalhes do salão
  doc.setFontSize(16)
  doc.text(props.dados.salao?.nome || 'Nome do Salão', 14, 18)
  doc.setFontSize(12)
  doc.text(`Endereço: ${props.dados.salao?.endereco || '-'}`, 14, 26)
  doc.text(`Telefone: ${props.dados.salao?.telefone || '-'}`, 14, 34)

  // Cabeçalho venda
  doc.setFontSize(14)
  doc.text(`Recibo de Venda #${props.dados.venda.id}`, 14, 46)
  doc.setFontSize(12)
  doc.text(`Data: ${formatarData(props.dados.venda.dataVenda)}`, 14, 54)
  doc.text(`Cliente: ${props.dados.cliente.nome}`, 14, 62)
  doc.text(`Telefone: ${props.dados.cliente.telefone || '-'}`, 14, 70)
  doc.text(`Email: ${props.dados.cliente.email || '-'}`, 14, 78)

  // Serviços
  let startY = 86
  if (props.dados.servicos.length) {
    autoTable(doc, {
      head: [['Serviço', 'Preço', 'Funcionário', 'Função']],
      body: props.dados.servicos.map(s => [
        s.nome,
        parseFloat(s.preco).toFixed(2),
        s.funcionario?.nome || '-',
        s.funcionario?.funcao || '-'
      ]),
      startY
    })
    startY = doc.lastAutoTable.finalY + 10
  }

  // Produtos
  if (props.dados.produtos.length) {
    autoTable(doc, {
      head: [['Produto', 'Preço', 'Qtd']],
      body: props.dados.produtos.map(p => [
        p.nome,
        parseFloat(p.preco).toFixed(2),
        p.quantidade
      ]),
      startY
    })
    startY = doc.lastAutoTable.finalY + 10
  }

  // Pagamento e total
  doc.text(`Método de Pagamento: ${props.dados.metodoPagamento || '-'}`, 14, startY)
  startY += 8
  doc.text(`Total: Kz ${formatarValor(props.dados.venda.valorTotal)}`, 14, startY)
  startY += 8

  // Observações
  if (props.dados.venda.observacoes) {
    doc.text('Observações:', 14, startY)
    doc.text(props.dados.venda.observacoes, 14, startY + 6)
    startY += 14
  }

  // Agradecimento ao cliente
  doc.setFontSize(12)
  doc.setTextColor(74, 20, 140) // roxo
  doc.text('Obrigado por escolher nosso salão! Sua beleza é nossa inspiração.', 14, startY + 10)
  doc.text('Esperamos vê-lo(a) novamente em breve!', 14, startY + 16)

  doc.save(`recibo-venda-${props.dados.venda.id}.pdf`)
}

// EXPORTAR CSV
const exportarCSV = () => {
  let csv = 'Tipo,Nome,Preço,Funcionário/Função,Quantidade\n'
  props.dados.servicos.forEach(s => {
    csv += `Serviço,${s.nome},${formatarValor(s.preco)},${s.funcionario?.nome || '-'} / ${s.funcionario?.funcao || '-'},-\n`
  })
  props.dados.produtos.forEach(p => {
    csv += `Produto,${p.nome},${formatarValor(p.preco)},-,-,${p.quantidade}\n`
  })
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', `recibo-venda-${props.dados.venda.id}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
/* Nenhum estilo adicional necessário */
</style>
