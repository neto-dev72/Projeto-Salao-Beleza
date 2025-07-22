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

      const labels = props.dados.map((item: any) => item.nome);
      const valores = props.dados.map((item: any) => item.quantidade);

      if (chart) chart.destroy();

      chart = new Chart(canvas.value, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            label: 'Distribuição',
            data: valores,
            backgroundColor: [
              '#3f51b5',
              '#2196f3',
              '#ff9800',
              '#4caf50',
              '#e91e63',
              '#9c27b0'
            ]
          }]
        },
        options: {
          responsive: true
        }
      });
    };

    onMounted(renderChart);
    watch(() => props.dados, renderChart, { deep: true });

    return { canvas };
  }
});
</script>
