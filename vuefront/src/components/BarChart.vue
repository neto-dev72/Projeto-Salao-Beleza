<template>
  <canvas ref="canvas"></canvas>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch, ref } from 'vue';
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

      const nomes = props.dados.map((s: any) => s.nome);
      const quantidades = props.dados.map((s: any) => s.quantidade);

      if (chart) chart.destroy();

      chart = new Chart(canvas.value, {
        type: 'bar',
        data: {
          labels: nomes,
          datasets: [{
            label: 'Serviços Vendidos',
            data: quantidades,
            backgroundColor: '#3f51b5'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
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
