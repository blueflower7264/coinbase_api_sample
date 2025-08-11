import React from 'react';
import { Line } from 'react-chartjs-2';
import { useCoinbaseAPI } from '../hooks/useCoinbaseAPI';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';

// Register chart components and zoom plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  zoomPlugin
);

export const PriceChart = ({ product, startTime, endTime }) => {
  const { data: history, loading } = useCoinbaseAPI(`history/${product}/${startTime}/${endTime}`);
  const wsData = useWebSocket('ws://localhost:8030');

  if (loading) return <div>Loading...</div>;

  const safeHistory =
    history && history.length > 0
      ? history
      : [
            { time: '2025-08-10T09:00:00Z', close: 110070, volume: 1500 },
            { time: '2025-08-10T09:05:00Z', close: 110150, volume: 1600 },
            { time: '2025-08-10T09:10:00Z', close: 110300, volume: 1550 },
            { time: '2025-08-10T09:15:00Z', close: 110250, volume: 1700 },
            { time: '2025-08-10T09:20:00Z', close: 110400, volume: 1650 },
            { time: '2025-08-10T09:25:00Z', close: 110350, volume: 1800 },
            { time: '2025-08-10T09:30:00Z', close: 110500, volume: 1750 },
            { time: '2025-08-10T09:35:00Z', close: 110450, volume: 1900 },
            { time: '2025-08-10T09:40:00Z', close: 110600, volume: 1850 },
            { time: '2025-08-10T09:45:00Z', close: 110550, volume: 2000 },
            { time: '2025-08-10T09:50:00Z', close: 110700, volume: 1950 },
            { time: '2025-08-10T09:55:00Z', close: 110650, volume: 2100 },
            { time: '2025-08-10T10:00:00Z', close: 110800, volume: 2050 },
            { time: '2025-08-10T10:05:00Z', close: 110750, volume: 2200 },
            { time: '2025-08-10T10:10:00Z', close: 110900, volume: 2150 },
            { time: '2025-08-10T10:15:00Z', close: 110850, volume: 2300 },
            { time: '2025-08-10T10:20:00Z', close: 111000, volume: 2250 },
            { time: '2025-08-10T10:25:00Z', close: 110950, volume: 2400 },
            { time: '2025-08-10T10:30:00Z', close: 111100, volume: 2350 },
            { time: '2025-08-10T10:35:00Z', close: 111050, volume: 2500 },
            { time: '2025-08-10T10:40:00Z', close: 111200, volume: 2450 },
            { time: '2025-08-10T10:45:00Z', close: 111150, volume: 2600 },
            { time: '2025-08-10T10:50:00Z', close: 111300, volume: 2550 },
            { time: '2025-08-10T10:55:00Z', close: 111250, volume: 2700 },
            { time: '2025-08-10T11:00:00Z', close: 111400, volume: 2650 },
        ];

  // Filter by start and end time if provided
  const filteredHistory = safeHistory.filter(item => {
    const itemTime = new Date(item.time).getTime();
    const start = startTime ? new Date(startTime).getTime() : -Infinity;
    const end = endTime ? new Date(endTime).getTime() : Infinity;
    return itemTime >= start && itemTime <= end;
  });

  // For X axis labels, show full date + time
  const labels = filteredHistory.map(item =>
    new Date(item.time).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Historical Price',
        data: filteredHistory.map(item => item.close),
        borderColor: 'rgba(54, 162, 235, 1)', // blue line
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 2,
      },
      ...(wsData?.type === 'ticker'
        ? [
            {
              label: 'Live Price',
              data: [...filteredHistory.slice(-29).map(item => item.close), wsData.price],
              borderColor: 'rgba(255, 99, 132, 1)', // red line
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              fill: true,
              tension: 0.3,
              pointRadius: 5,
              pointHoverRadius: 8,
              borderDash: [8, 5],
              borderWidth: 2,
            },
          ]
        : []),
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 14 }, color: '#eee' } },
      tooltip: {
        mode: 'nearest',
        intersect: false,
        callbacks: {
          label: ctx => `Price: $${ctx.parsed.y.toLocaleString()}`,
          title: ctx => {
            const i = ctx[0].dataIndex;
            return filteredHistory[i]?.time
              ? new Date(filteredHistory[i].time).toLocaleString()
              : '';
          },
        },
      },
      title: {
        display: true,
        text: `Price Chart for ${product}`,
        font: { size: 18, weight: 'bold' },
        padding: { top: 10, bottom: 30 },
        color: '#eee',
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
        pan: {
          enabled: true,
          mode: 'x',
        },
        limits: {
          x: { min: 'original', max: 'original' },
          y: { min: 'original', max: 'original' },
        },
      },
    },
    scales: {
      x: {
        type: 'category',
        title: { display: true, text: 'Date and Time', font: { size: 16 }, color: '#ccc' },
        ticks: {
          maxRotation: 45,
          minRotation: 30,
          maxTicksLimit: 10,
          color: '#ccc',
          autoSkip: true,
        },
        grid: { display: false },
      },
      y: {
        title: { display: true, text: 'Price (USD)', font: { size: 16 }, color: '#ccc' },
        grid: { color: 'rgba(200,200,200,0.2)', borderDash: [5, 5] },
        ticks: {
          callback: value => `$${value.toLocaleString()}`,
          maxTicksLimit: 8,
          color: '#ccc',
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};
