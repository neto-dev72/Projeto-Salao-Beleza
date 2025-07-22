<template>
  <v-dialog :model-value="mostrar" max-width="900" @update:model-value="$emit('fechar')">
    <v-card>
      <v-card-title class="text-h6">
        Histórico de <strong>{{ cliente?.nome }}</strong>
      </v-card-title>

      <v-card-text>
        <v-row class="mb-4" dense>
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-3" variant="tonal">
              <strong>Email:</strong><br /> {{ cliente?.email || '—' }}
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-3" variant="tonal">
              <strong>Telefone:</strong><br /> {{ cliente?.telefone || '—' }}
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-3" variant="tonal">
              <strong>Localidade:</strong><br /> {{ cliente?.localidade || '—' }}
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-3" variant="tonal">
              <strong>Nascimento:</strong><br />
              {{ formatarData(cliente?.dataNascimento) || '—' }}
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-card class="pa-3" variant="tonal">
              <strong>Observações:</strong>
              <div class="text-grey-darken-1">
                {{ cliente?.observacoes || 'Nenhuma' }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <!-- Novos dados (total gasto, serviço mais comprado e produto mais comprado) -->
        <v-row>
          <v-col cols="12" sm="4">
            <v-card class="pa-3" variant="tonal">
              <strong>Total Gasto:</strong><br /> Kz {{ totalGasto.toFixed(2) }}
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card class="pa-3" variant="tonal">
              <strong>Serviço Mais Comprado:</strong><br /> {{ servicoMaisComprado || '—' }}
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card class="pa-3" variant="tonal">
              <strong>Produto Mais Comprado:</strong><br /> {{ produtoMaisComprado || '—' }}
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <v-alert v-if="!historico || historico.length === 0" type="info">
          Nenhuma venda registrada para este cliente.
        </v-alert>

        <v-timeline v-else align="start">
          <v-timeline-item
            v-for="venda in historico"
            :key="venda.id"
            dot-color="primary"
            icon="mdi-cash-register"
          >
            <template #opposite>
              {{ formatarData(venda.dataVenda) }}
            </template>
            <template #default>
              <v-card class="pa-3">
                <div class="font-weight-medium mb-2">
                  💰 Valor total: Kz {{ venda.valorTotal.toFixed(2) }}
                </div>
                <v-list density="compact">
                  <v-list-item
                    v-for="servico in venda.servicos"
                    :key="servico.id"
                    class="px-0"
                  >
                    {{ servico.nome }} – Kz {{ servico.preco.toFixed(2) }}
                  </v-list-item>
                </v-list>
                <div v-if="venda.observacoes" class="text-caption text-grey-darken-1 mt-2">
                  <strong>Obs:</strong> {{ venda.observacoes }}
                </div>
              </v-card>
            </template>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('fechar')" color="primary">Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, watch } from 'vue'

const props = defineProps<{
  mostrar: boolean
  cliente: {
    nome: string
    email?: string
    telefone?: string
    localidade?: string
    dataNascimento?: string
    observacoes?: string
  }
  historico: {
    id: number
    dataVenda: string
    valorTotal: number
    observacoes?: string
    servicos: { id: number; nome: string; preco: number }[]
    produtos: { id: number; nome: string; preco: number }[]
  }[]
  totalGasto: number
  servicoMaisComprado: string
  produtoMaisComprado: string
}>()

const emit = defineEmits(['fechar'])

const formatarData = (data?: string) =>
  data ? new Date(data).toLocaleDateString('pt-BR') : ''
</script>

<style scoped>
.v-list-item {
  transition: background-color 0.2s ease;
  cursor: pointer;
}
.v-list-item.grey {
  background-color: #e0e0e0 !important;
}
</style>
