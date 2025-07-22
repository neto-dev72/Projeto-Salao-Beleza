<template>
  <v-card class="ficha-card">
    <v-card-title class="ficha-header">
      <span class="ficha-titulo">
        <v-icon start icon="mdi-file-document-outline" class="mr-2" />Ficha do Agendamento #{{ agendamento?.id }}
      </span>
      <div class="ficha-actions">
        <v-btn size="small" color="blue" variant="flat" class="ficha-btn" @click="baixarPNG">
          <v-icon start icon="mdi-image" /> PNG
        </v-btn>
        <v-btn size="small" color="red-darken-1" variant="flat" class="ficha-btn" @click="baixarPDF">
          <v-icon start icon="mdi-file-pdf-box" /> PDF
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text ref="fichaRef" v-show="carregado" class="ficha-body">
      <v-row dense>
        <v-col cols="12" md="6">
          <div class="info-box">
            <div class="info-label">
              <v-icon icon="mdi-calendar-clock" class="mr-1" />
              Data e Hora
            </div>
            <div class="info-content">{{ formatarDataHora(agendamento?.dataHora) }}</div>
          </div>

          <div class="info-box">
            <div class="info-label">
              <v-icon icon="mdi-note-text-outline" class="mr-1" />
              Observações
            </div>
            <div class="info-content">{{ agendamento?.observacoes || 'Nenhuma observação registrada.' }}</div>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <div class="info-box">
            <div class="info-label">
              <v-icon icon="mdi-account-circle-outline" class="mr-1" />
              Dados do Cliente
            </div>
            <div v-if="cliente" class="info-content">
              <p><strong>Nome:</strong> {{ cliente.nome }}</p>
              <p><strong>Telefone:</strong> {{ cliente.telefone || 'Não informado' }}</p>
              <p><strong>Email:</strong> {{ cliente.email || 'Não informado' }}</p>
              <p><strong>Nascimento:</strong> {{ formatarData(cliente.dataNascimento) || 'Não informado' }}</p>
              <p><strong>Localidade:</strong> {{ cliente.localidade || 'Não informado' }}</p>
            </div>
            <div v-else class="info-content erro">Cliente não encontrado ou removido.</div>
          </div>

          <div class="info-box mt-4">
            <div class="info-label">
              <v-icon icon="mdi-cash-multiple" class="mr-1" />
              Método de Pagamento
            </div>
            <div class="info-content">{{ metodoPagamento?.tipo || 'Não informado' }}</div>
          </div>
        </v-col>
      </v-row>

      <div class="info-box mt-4">
        <div class="info-label">
          <v-icon icon="mdi-scissors-cutting" class="mr-1" />
          Serviços
        </div>
        <ul class="servico-list">
          <li v-for="servico in servicos" :key="servico.id">
            <v-icon icon="mdi-check-bold" size="16" color="green" class="mr-1" />
            <strong>{{ servico.nome }}</strong> – <span class="preco-servico">{{ formatarKz(servico.preco) }} Kz</span>
          </li>
        </ul>
      </div>

      <!-- Novo Bloco para Funcionário -->
      <div class="info-box mt-4">
        <div class="info-label">
          <v-icon icon="mdi-account-circle" class="mr-1" />
          Profissional Responsável pelo Serviço
        </div>
        <ul class="funcionario-list">
          <li v-for="servico in servicos" :key="servico.id">
            <v-icon icon="mdi-check-circle-outline" size="16" color="blue" class="mr-1" />
            <strong>{{ servico.funcionario?.nome || 'Não atribuído' }}</strong> – {{ servico.funcionario?.funcao || 'Sem função definida' }}
          </li>
        </ul>
      </div>

      <div class="info-box mt-4">
        <div class="info-label">
          <v-icon icon="mdi-cube-outline" class="mr-1" />
          Produtos
        </div>
        <ul class="produto-list">
          <li v-for="produto in produtos" :key="produto.id">
            <v-icon icon="mdi-check-bold" size="16" color="blue" class="mr-1" />
            <strong>{{ produto.nome }}</strong> – <span class="preco-produto">{{ formatarKz(produto.preco) }} Kz</span>
          </li>
        </ul>
      </div>

      <v-alert
        v-if="agendamento?.finalizado"
        type="success"
        class="mt-6 rounded-lg ficha-alert"
        border="start"
        elevation="2"
      >
        <v-icon start icon="mdi-check-circle-outline" class="mr-1" />Atendimento finalizado<br />
        <strong>Total gasto:</strong> {{ formatarKz(totalGasto) }} Kz
      </v-alert>
    </v-card-text>

    <v-card-actions class="ficha-footer">
      <v-spacer />
      <v-btn color="primary" variant="elevated" class="font-weight-bold" @click="$emit('close')">
        <v-icon start icon="mdi-close-circle-outline" class="mr-1" />Fechar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, watch, computed, nextTick } from 'vue'
import axios from 'axios'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const props = defineProps<{ agendamento: any }>()
const emit = defineEmits(['close'])

const servicos = ref<any[]>([])
const produtos = ref<any[]>([])  // Adicionando o array de produtos
const cliente = ref<any>(null)
const metodoPagamento = ref<any>(null)
const fichaRef = ref<HTMLElement | null>(null)
const carregado = ref(false)

watch(
  () => props.agendamento,
  async (novo) => {
    carregado.value = false
    if (!novo?.id) return
    try {
      const res = await axios.get(`/agendamentos/${novo.id}/ficha`)
      servicos.value = res.data.servicos
      produtos.value = res.data.produtos  // Recebendo os produtos da API
      cliente.value = res.data.cliente
      metodoPagamento.value = res.data.metodoPagamento
      await nextTick()
      carregado.value = true
    } catch (error) {
      console.error('Erro ao carregar ficha:', error)
    }
  },
  { immediate: true }
)

const totalGasto = computed(() =>
  servicos.value.reduce((sum, s) => sum + parseFloat(s.preco), 0) +
  produtos.value.reduce((sum, p) => sum + parseFloat(p.preco), 0) // Incluindo o total gasto com produtos
)

function formatarDataHora(dataISO: string): string {
  if (!dataISO) return ''
  return new Date(dataISO).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}
function formatarData(dataISO: string): string {
  if (!dataISO) return ''
  return new Date(dataISO).toLocaleDateString('pt-BR')
}
function formatarKz(valor: number): string {
  return valor.toLocaleString('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

async function baixarPNG() {
  await nextTick()
  setTimeout(async () => {
    const el = fichaRef.value
    if (!el) return
    const canvas = await html2canvas(el)
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `ficha_agendamento_${props.agendamento.id}.png`
    link.click()
  }, 100)
}
async function baixarPDF() {
  await nextTick()
  setTimeout(async () => {
    const el = fichaRef.value
    if (!el) return
    const canvas = await html2canvas(el)
    const img = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const propsImg = pdf.getImageProperties(img)
    const width = pdf.internal.pageSize.getWidth()
    const height = (propsImg.height * width) / propsImg.width
    pdf.addImage(img, 'PNG', 0, 0, width, height)
    pdf.save(`ficha_agendamento_${props.agendamento.id}.pdf`)
  }, 100)
}
</script>

<style scoped>
.ficha-card { background: #fff; border-radius: 16px; padding: 24px; }
.ficha-header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 12px; }
.ficha-titulo { font-size: 1.25rem; font-weight: 600; color: #333; }
.ficha-actions { display: flex; gap: 8px; }
.ficha-btn { text-transform: none; font-weight: 500; color: white; }
.ficha-body { margin-top: 20px; background: #f4f6f8; padding: 24px; border-radius: 12px; }
.info-box { background: #fff; border: 1px solid #ddd; padding: 16px; border-radius: 10px; margin-bottom: 16px; }
.info-label { font-weight: 600; font-size: 0.95rem; color: #555; margin-bottom: 6px; display: flex; align-items: center; }
.info-content { font-size: 0.92rem; color: #222; }
.erro { color: #d32f2f; font-weight: 500; }
.servico-list, .produto-list { list-style: none; padding: 0; margin: 0; }
.servico-list li, .produto-list li { margin-bottom: 6px; display: flex; align-items: center; font-size: 0.92rem; }
.ficha-alert { background-color: #e9f9ec; border-color: #4caf50; color: #2e7d32; }
.ficha-footer { margin-top: 16px; }

.preco-servico {
  margin-left: auto;
  text-align: right;
  color: #00796b;
}

.funcionario-info {
  margin-top: 4px;
  font-size: 0.85rem;
  color: #616161;
}

.funcionario-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.funcionario-list li {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  font-size: 0.92rem;
  color: #333;
}
</style>
