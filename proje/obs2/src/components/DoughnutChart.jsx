import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {Chart, ArcElement, Tooltip, Legend, Title} from 'chart.js';


Chart.register(ArcElement, Tooltip, Legend, Title);
Chart.defaults.plugins.tooltip.backgroundColor = 'rgb(0, 0, 156)';
Chart.defaults.plugins.legend.position = 'right';
Chart.defaults.plugins.legend.title.display = true;
Chart.defaults.plugins.legend.title.text = '60 of 100 Done';
Chart.defaults.plugins.legend.title.font = 'Helvetica Neue';

const DoughnutChart = () => {
  const data = {
    labels: ['Yok Gün', 'Var Gün'],
    datasets: [
      {
        data: [60, 40],
        backgroundColor: ['rgb(28, 37, 52)', 'rgb(204, 223, 243)'],
        borderWidth: 2,
        radius: '80%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Set to false to allow custom width and height
  };

  const chartStyle = {
    width: '350px', // Set your desired width
    height: '250px', // Set your desired height
  };

  return (
    <div className=' flex items-center justify-center '>
      <Doughnut className='' data={data} options={options} style={chartStyle} />
    </div>
  );
};

export default DoughnutChart;
