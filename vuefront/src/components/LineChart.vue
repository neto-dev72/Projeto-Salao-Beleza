<template>
  <canvas ref="canvas"></canvas>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import Chart from 'chart.js/auto';

export default defineComponent({
  props: {
    dados: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement | null>(null);
    let chart: Chart | null = null;

    const renderChart = () => {
      if (!canvas.value) return;

      const labels = props.dados.map((item: any) => item.dia);
      const valores = props.dados.map((item: any) => item.total);

      if (chart) chart.destroy();

      chart = new Chart(canvas.value, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Total de Vendas (R$)',
            data: valores,
            fill: false,
            borderColor: '#3f51b5',
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    };

    onMounted(renderChart);
    watch(() => props.dados, renderChart, { deep: true });

    return { canvas };
  }
});
</script>
