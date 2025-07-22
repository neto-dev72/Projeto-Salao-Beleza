<template>
  <v-dialog v-model="mostrar" max-width="800">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>📜 Histórico de {{ funcionario.nome }}</span>
        <v-btn icon color="red" @click="fecharHistorico">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="filtro"
              label="Buscar por serviço"
              prepend-inner-icon="mdi-magnify"
              clearable
            />
          </v-col>
          <v-col cols="12" md="6" class="d-flex align-center">
            <span>
              <strong>Total ganho: </strong> 
              Kz {{ typeof totalGanho === 'number' ? totalGanho.toFixed(2) : '0.00' }}
            </span>
            <span v-if="typeof kzGanho === 'number'" class="ml-4">
              <strong>Total ganho em Kz: </strong> 
              Kz {{ kzGanho.toFixed(2) }}
            </span>
          </v-col>
        </v-row>

        <!-- Tabela de Histórico de Vendas -->
        <v-data-table
          v-if="historico.length"
          :headers="headers"
          :items="historicoFiltrado"
          :items-per-page="5"
          class="elevation-1 mt-4"
        >
          <template #item.servico="{ item }">
            <span>{{ item.servicoNome }}</span>
          </template>

          <template #item.data="{ item }">
            <span>{{ item.data | formatDate }}</span>
          </template>

          <template #item.valor="{ item }">
            <span v-if="typeof item.valor === 'number'">Kz {{ item.valor.toFixed(2) }}</span>
            <span v-else>Kz 0.00</span>

            <span v-if="typeof item.valorKz === 'number'" class="ml-4">Kz {{ item.valorKz.toFixed(2) }}</span>
          </template>
        </v-data-table>

        <!-- Caso não tenha histórico -->
        <v-alert v-if="!historico.length" type="info" class="mt-4">
          Não há registros de serviços realizados por este funcionário.
        </v-alert>

        <!-- Serviço Mais Realizado -->
        <v-divider class="mt-5"></v-divider>
        <v-row>
          <v-col cols="12">
            <v-subheader class="mt-3">Serviço mais realizado:</v-subheader>
            <v-chip color="primary">{{ servicoMaisRealizado }}</v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

// Definindo o tipo para os itens do histórico
interface HistoricoItem {
  servicoNome: string;
  data: string;
  valor: number | null;
  valorKz?: number | null;
}

export default defineComponent({
  name: 'HistoricoFuncionario',
  props: {
    mostrar: {
      type: Boolean,
      required: true
    },
    funcionario: {
      type: Object,
      required: true
    },
    historico: {
      type: Array as () => HistoricoItem[],
      required: true
    },
    totalGanho: {
      type: Number,
      required: true
    },
    servicoMaisRealizado: {
      type: String,
      required: true
    },
    kzGanho: {
      type: Number,
      default: null
    }
  },
  setup(props, { emit }) {
    const filtro = ref('')

    const headers = [
      { text: 'Serviço', value: 'servico' },
      { text: 'Data', value: 'data' },
      { text: 'Valor', value: 'valor' }
    ]

    const historicoFiltrado = computed(() => {
      return props.historico.filter((item: HistoricoItem) =>
        item.servicoNome.toLowerCase().includes(filtro.value.toLowerCase())
      )
    })

    // Função para fechar o modal
    const fecharHistorico = () => {
      emit('fechar')
    }

    // Formatador de data
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
  font-size: 1.2rem;
  font-weight: bold;
}

.v-data-table th {
  background-color: #f5f5f5;
}

.ml-4 {
  margin-left: 16px;
}
</style>
