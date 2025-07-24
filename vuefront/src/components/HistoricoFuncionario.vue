<template>
  <v-dialog v-model="mostrar" max-width="900">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>📜 Histórico de {{ funcionario.nome }}</span>
        <v-btn icon color="red" @click="fecharHistorico">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Filtros e totais -->
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="filtro"
              label="Buscar por serviço, cliente ou pagamento"
              prepend-inner-icon="mdi-magnify"
              clearable
            />
          </v-col>
          <v-col cols="12" md="6" class="d-flex align-center justify-space-between">
            <span>
              <strong>Total ganho: </strong>
              Kz {{ typeof totalGanho === 'number' ? totalGanho.toFixed(2) : '0.00' }}
            </span>
            <span v-if="typeof kzGanho === 'number'">
              <strong>Conversão em Kz: </strong>
              Kz {{ kzGanho.toFixed(2) }}
            </span>
          </v-col>
        </v-row>

        <!-- Tabela de Histórico -->
        <v-data-table
          v-if="historico.length"
          :headers="headers"
          :items="historicoFiltrado"
          :items-per-page="5"
          class="elevation-1 mt-4"
        >
          <template #item.data="{ item }">
            <span>{{ formatDate(item.data) }}</span>
          </template>

          <template #item.valor="{ item }">
            <span>Kz {{ item.valor?.toFixed(2) ?? '0.00' }}</span>
          </template>
        </v-data-table>

        <!-- Nenhum histórico -->
        <v-alert v-else type="info" class="mt-4">
          Não há registros de serviços realizados por este funcionário.
        </v-alert>

        <!-- Serviço mais realizado -->
        <v-divider class="mt-5" />
        <v-row>
          <v-col cols="12">
            <v-subheader class="mt-3">Serviço mais realizado:</v-subheader>
            <v-chip color="primary" class="ma-1">
              {{ servicoMaisRealizado || 'Nenhum' }}
            </v-chip>
          </v-col>
        </v-row>

        <!-- Ranking de serviços -->
        <v-row v-if="rankingServicos.length">
          <v-col cols="12">
            <v-subheader class="mt-3">Ranking de serviços:</v-subheader>
            <v-chip
              v-for="(item, index) in rankingServicos"
              :key="index"
              class="ma-1"
              color="secondary"
              label
            >
              {{ item.nome }} ({{ item.quantidade }})
            </v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

interface HistoricoItem {
  servicoNome: string
  data: string
  valor: number | null
  clienteNome?: string
  metodoPagamento?: string
}

interface RankingItem {
  nome: string
  quantidade: number
}

export default defineComponent({
  name: 'HistoricoFuncionario',
  props: {
    mostrar: { type: Boolean, required: true },
    funcionario: { type: Object, required: true },
    historico: { type: Array as () => HistoricoItem[], required: true },
    totalGanho: { type: Number, required: true },
    servicoMaisRealizado: { type: String, required: true },
    kzGanho: { type: Number, default: null },
    rankingServicos: {
      type: Array as () => RankingItem[],
      default: () => []
    }
  },
  setup(props, { emit }) {
    const filtro = ref('')

    const headers = [
      { text: 'Data', value: 'data' },
      { text: 'Serviço', value: 'servicoNome' },
      { text: 'Cliente', value: 'clienteNome' },
      { text: 'Pagamento', value: 'metodoPagamento' },
      { text: 'Valor', value: 'valor' }
    ]

    const historicoFiltrado = computed(() => {
      return props.historico.filter(item =>
        [item.servicoNome, item.clienteNome, item.metodoPagamento]
          .filter(Boolean)
          .some(campo => campo!.toLowerCase().includes(filtro.value.toLowerCase()))
      )
    })

    const fecharHistorico = () => emit('fechar')

    const formatDate = (value: string) => {
      const date = new Date(value)
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return {
      filtro,
      headers,
      historicoFiltrado,
      fecharHistorico,
      formatDate
    }
  }
})
</script>

<style scoped>
.v-chip {
  font-size: 1rem;
  font-weight: 600;
}

.v-data-table th {
  background-color: #f5f5f5;
}

.ma-1 {
  margin: 4px !important;
}
</style>
