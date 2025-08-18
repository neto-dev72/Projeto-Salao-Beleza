<template>
  <v-dialog :model-value="mostrar" max-width="900" @update:model-value="$emit('fechar')" transition="dialog-bottom-transition">
    <v-card elevation="26" class="pa-6" style="border-radius: 12px;">
      <v-card-title class="text-h5 font-weight-bold text-center">
        Histórico de <strong>{{ cliente?.nome }}</strong>
      </v-card-title>

      <v-card-text>
        <!-- Dados principais do cliente -->
        <v-row class="mb-6" dense>
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4" outlined elevation="4" style="border-radius: 10px;">
              <v-row>
                <v-col class="text-center">
                  <strong>Email:</strong><br />
                  <span class="text-body-1">{{ cliente?.email || '—' }}</span>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4" outlined elevation="4" style="border-radius: 10px;">
              <v-row>
                <v-col class="text-center">
                  <strong>Telefone:</strong><br />
                  <span class="text-body-1">{{ cliente?.telefone || '—' }}</span>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4" outlined elevation="4" style="border-radius: 10px;">
              <v-row>
                <v-col class="text-center">
                  <strong>Localidade:</strong><br />
                  <span class="text-body-1">{{ cliente?.localidade || '—' }}</span>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4" outlined elevation="4" style="border-radius: 10px;">
              <v-row>
                <v-col class="text-center">
                  <strong>Nascimento:</strong><br />
                  <span class="text-body-1">{{ formatarData(cliente?.dataNascimento) || '—' }}</span>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <v-col cols="12">
            <v-card class="pa-4" outlined elevation="4" style="border-radius: 10px;">
              <strong>Observações:</strong>
              <div class="text-caption text-grey-darken-1">
                {{ cliente?.observacoes || 'Nenhuma' }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <!-- Dados financeiros e serviços -->
        <v-row>
          <v-col cols="12" sm="4">
            <v-card class="pa-4" outlined elevation="4" style="border-radius: 10px;">
              <strong>Total Gasto:</strong><br />
              <span class="text-h5">Kz {{ totalGasto.toFixed(2) }}</span>
            </v-card>
          </v-col>

          <v-col cols="12" sm="4">
            <v-card class="pa-4" outlined elevation="4" style="border-radius: 10px;">
              <strong>Serviço Mais Comprado:</strong><br />
              <v-chip class="mt-2" color="primary" text-color="white" outlined>
                {{ servicoMaisComprado || '—' }}
              </v-chip>
            </v-card>
          </v-col>

          <v-col cols="12" sm="4">
            <v-card class="pa-4" outlined elevation="4" style="border-radius: 10px;">
              <strong>Produto Mais Comprado:</strong><br />
              <v-chip class="mt-2" color="secondary" text-color="white" outlined>
                {{ produtoMaisComprado || '—' }}
              </v-chip>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <!-- Histórico de vendas -->
        <v-alert v-if="!historico || historico.length === 0" type="info" class="mt-4" elevation="2">
          Nenhuma venda registrada para este cliente.
        </v-alert>

        <v-timeline v-else align="start" :dense="true">
          <v-timeline-item
            v-for="venda in historico"
            :key="venda.id"
            dot-color="primary"
            icon="mdi-cash-register"
            class="pb-4"
          >
            <template #opposite>
              <span class="text-caption">{{ formatarData(venda.dataVenda) }}</span>
            </template>
            <template #default>
              <v-card class="pa-4" outlined elevation="4" style="border-radius: 10px;">
                <div class="font-weight-medium mb-3">
                  💰 Valor total: <strong>Kz {{ venda.valorTotal.toFixed(2) }}</strong>
                </div>

                <!-- Serviços da venda -->
                <v-list dense>
                  <v-list-item
                    v-for="servico in venda.servicos"
                    :key="servico.id"
                    class="px-0"
                  >
                    <v-chip color="blue" text-color="white" class="mr-2">{{ servico.nome }}</v-chip>
                    Kz {{ servico.preco.toFixed(2) }}
                  </v-list-item>
                </v-list>

                <!-- Observações da venda -->
                <div v-if="venda.observacoes" class="text-caption text-grey-darken-1 mt-2">
                  <strong>Obs:</strong> {{ venda.observacoes }}
                </div>
              </v-card>
            </template>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>

      <!-- Ações -->
      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('fechar')" color="primary" variant="contained" class="rounded transition-transform transform hover:scale-105">
          Fechar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue'

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
.v-list-item:hover {
  background-color: #e3f2fd !important;
}

.v-chip {
  margin: 0 4px;
  transition: transform 0.2s ease;
}
.v-chip:hover {
  transform: scale(1.1);
}

.v-timeline-item {
  transition: transform 0.3s ease;
}
.v-timeline-item:hover {
  transform: scale(1.05);
}

.v-btn {
  transition: transform 0.3s ease;
}
.v-btn:hover {
  transform: scale(1.05);
}
</style>
