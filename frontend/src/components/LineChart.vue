<!-- PieChart.vue -->
<template>
  <div :id="props.chart_id" class="chart-container"></div>
</template>

<script setup lang="ts">
import { defineProps, watchEffect, onBeforeUnmount, nextTick } from 'vue';
import Highcharts, { SeriesLineOptions, Chart, Options } from 'highcharts';

const props = defineProps<{
  title: string;
  data: {
    categories: string[];
    series: SeriesLineOptions[];
  };
  chart_id: string;
}>();

let chartInstance: Chart | null = null;


const calculateTickInterval = () => {

  const targetLabels = 10;

  const timestamps = props.data.categories.map(date => new Date(date).getTime());
  const range = Math.max(...timestamps) - Math.min(...timestamps);

  const tickInterval = range / targetLabels;
  
  return tickInterval;
};

const createChart = () => {
  const chartContainer = document.getElementById(props.chart_id);
  
  if (!chartContainer) {
    console.error('Chart container not found:', props.chart_id);
    return;
  }

  const calculatedTickInterval = calculateTickInterval();

  const options: Options = {
    chart: {
      renderTo: chartContainer,
      type: 'line', 
    },
    title: {
      text: props.title,
      align: 'center',
    },
    xAxis: {
      type: 'datetime',
      tickInterval: calculatedTickInterval, // Set dynamic tick interval
      labels: {
        format: '{value:%e %b %H:%M}',
        rotation: calculatedTickInterval < 60 * 60 * 1000 ? -45 : 0, // Rotate labels for denser data
        align: calculatedTickInterval < 60 * 60 * 1000 ? 'right' : 'center',
        style: {
          fontSize: '10px',
          whiteSpace: 'nowrap',
        },
      },
      title: {
        text: '',
      },
      dateTimeLabelFormats: {
        millisecond: '%H:%M:%S.%L',
        second: '%H:%M:%S',
        minute: '%H:%M',
        hour: '%H:%M',
        day: '%e. %b',
        week: '%e. %b',
        month: '%b \'%y',
        year: '%Y',
      },
    },
    yAxis: {
      title: {
        text: '',
      },
      labels: {
        format: '{value}',
      },
    },
    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
    },
    tooltip: {
      shared: true,
      xDateFormat: '%e %b %Y %H:%M',
    },
    plotOptions: {
      line: {
        marker: {
          enabled: true,
          radius: 3,
        },
        dataLabels: {
          enabled: false,
        },
      },
      series: {
        turboThreshold: 0, 
      },
    },
    series: props.data.series,
    responsive: {
      rules: [
        {
          condition: { maxWidth: 600 },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom',
            },
            xAxis: {
              labels: {
                rotation: -45,
                align: 'right',
              },
            },
          },
        },
      ],
    },
  };

  chartInstance = Highcharts.chart(options);
};

const updateChart = () => {
  if (!chartInstance) return;

  const calculatedTickInterval = calculateTickInterval();

  chartInstance.update({
    xAxis: {
      tickInterval: calculatedTickInterval,
      labels: {
        rotation: calculatedTickInterval < 60 * 60 * 1000 ? -45 : 0,
        align: calculatedTickInterval < 60 * 60 * 1000 ? 'right' : 'center',
      },
    },
  }, false);

  // Update series data
  chartInstance.series.forEach((series, index) => {
    const seriesOptions = props.data.series[index];
    if (seriesOptions.data) {
      series.setData(seriesOptions.data, false, { duration: 800 });
    }
  });

  chartInstance.redraw();
};

watchEffect(() => {
  if (props.data.categories.length && props.data.series.length) {
    nextTick(() => {
      if (!chartInstance) {
        createChart();
      } else {
        updateChart();
      }
    });
  }
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
