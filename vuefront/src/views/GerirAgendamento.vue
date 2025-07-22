<template>
  <v-container>
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="6">
        <h1 class="text-h5 font-weight-bold">Gerir Agendamentos</h1>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="filtroData"
          label="Filtrar por data"
          type="date"
          prepend-icon="mdi-calendar"
          dense
          outlined
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="filtroNome"
          label="Filtrar por nome do cliente"
          prepend-icon="mdi-account-search"
          dense
          outlined
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="agendamentosFiltrados"
          :loading="carregando"
          class="elevation-1"
          loading-text="Carregando agendamentos..."
          item-value="id"
        >
          <template #item.dataHora="{ item }">
            {{ formatarData(item.dataHora) }}
          </template>

          <template #item.finalizado="{ item }">
            <v-chip :color="item.finalizado ? 'green' : 'grey'" dark small>
              {{ item.finalizado ? 'Sim' : 'Não' }}
            </v-chip>
          </template>

          <template #item.acoes="{ item }">
            <v-btn size="small" color="primary" @click="verFicha(item)">
              Ver Ficha
            </v-btn>
            <v-btn
              size="small"
              color="success"
              @click="finalizarAgendamento(item)"
              :disabled="item.finalizado"
            >
              Finalizar
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Botões de download -->
    <v-row v-if="dialogAberto" class="mt-2" justify="center">
      <v-btn color="primary" @click="baixarFichaPNG">Baixar PNG</v-btn>
      <v-btn color="secondary" @click="baixarFichaPDF">Baixar PDF</v-btn>
    </v-row>

    <!-- Modal da FichaAgendamento -->
    <v-dialog v-model="dialogAberto" max-width="600">
      <FichaAgendamento
        ref="modalRef"
        v-if="agendamentoSelecionado"
        :agendamento="agendamentoSelecionado"
        @close="dialogAberto = false"
      />
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import axios from 'axios'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import FichaAgendamento from '../components/FichaAgendamento.vue'

interface Agendamento {
  id: number
  dataHora: string
  observacoes: string
  finalizado: boolean
  ClienteId: number
  clienteNome: string
}

const agendamentos = ref<Agendamento[]>([])
const carregando = ref(false)
const filtroData = ref<string>('')
const filtroNome = ref<string>('') // novo filtro

const dialogAberto = ref(false)
const agendamentoSelecionado = ref<Agendamento | null>(null)
const modalRef = ref()

const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Data/Hora', value: 'dataHora' },
  { text: 'Cliente', value: 'clienteNome' },
  { text: 'Finalizado', value: 'finalizado' },
  { text: 'Ações', value: 'acoes', sortable: false },
]

// Computed para filtrar os agendamentos pelo nome
const agendamentosFiltrados = computed(() => {
  if (!filtroNome.value) return agendamentos.value
  return agendamentos.value.filter(a =>
    a.clienteNome.toLowerCase().includes(filtroNome.value.toLowerCase())
  )
})

function formatarData(dataISO: string): string {
  const data = new Date(dataISO)
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const ano = String(data.getFullYear()).slice(-2)
  return `${dia}/${mes}/${ano}`
}

async function carregarAgendamentos() {
  carregando.value = true
  try {
    const url = filtroData.value
      ? `/agendamentos?data=${filtroData.value}`
      : `/agendamentos`
    const res = await axios.get(url)
    agendamentos.value = res.data
  } catch (err) {
    console.error('Erro ao buscar agendamentos:', err)
  } finally {
    carregando.value = false
  }
}

function verFicha(agendamento: Agendamento) {
  agendamentoSelecionado.value = agendamento
  dialogAberto.value = true
}

async function finalizarAgendamento(agendamento: Agendamento) {
  if (!confirm('Deseja realmente finalizar este agendamento?')) return

  try {
    await axios.post(`/agendamentos/${agendamento.id}/finalizar`)
    await carregarAgendamentos()
  } catch (err) {
    console.error('Erro ao finalizar agendamento:', err)
    alert('Erro ao finalizar o agendamento.')
  }
}

async function baixarFichaPNG() {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 300))

  const el = modalRef.value?.fichaRef
  if (!el) return console.warn('Ficha não carregada')

  const canvas = await html2canvas(el, { backgroundColor: '#fff' })
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = `ficha_agendamento_${agendamentoSelecionado.value?.id}.png`
  link.click()
}

async function baixarFichaPDF() {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 300))

  const el = modalRef.value?.fichaRef
  if (!el) return console.warn('Ficha não carregada')

  const canvas = await html2canvas(el, { backgroundColor: '#fff' })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const props = pdf.getImageProperties(imgData)
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (props.height * pdfWidth) / props.width
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(`ficha_agendamento_${agendamentoSelecionado.value?.id}.pdf`)
}

onMounted(carregarAgendamentos)
watch(filtroData, carregarAgendamentos)
</script>
