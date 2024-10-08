<template>
    <div :id="chart_id" class="chart-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import Highcharts, { Chart, Options, SeriesPieOptions } from 'highcharts';

const props = defineProps<{
    chart_id: string;
    data: { name: string; y: number }[];
}>();

let chartInstance: Chart | null = null;

const createChart = () => {
    const chartContainer = document.getElementById(props.chart_id);
    if (!chartContainer) {
        console.error(`Chart container not found: ${props.chart_id}`);
        return;
    }

    const options: Options = {
    chart: {
        type: 'pie',
        height: chartContainer.offsetHeight,
        width: chartContainer.offsetWidth,
    },
    title: {
        text: "",
    },
    tooltip: {
        pointFormat: '<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)',
        backgroundColor: '#ffffff',
        borderColor: '#ccc',
        style: {
            color: '#333',
        },
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            innerSize: '0%', 
            dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.y}', 
                style: {
                    fontSize: '12px',
                    color: '#333',
                },
            },
            showInLegend: false, 
            shadow: {
                color: '#ccc',
                width: 2,
                opacity: 0.8,
            },
        },
    },
    series: [
        {
            type: 'pie',
            name: 'Percent',
            colorByPoint: true,
            data: props.data,
            colors: ['#C7253E', '#41B3A2'],
        } as SeriesPieOptions,
    ],
};

    chartInstance = Highcharts.chart(chartContainer, options);
};

onMounted(() => {
    createChart();
});

onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.destroy();
    }
});
</script>

<style scoped>
.chart-container {
    width: 100%;
    height: 100%;
}
</style>