import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React from "react";
import { status } from "./types/types";

interface StatusChartProps {
  statusCounts: Record<status, number>;
}

const StatusChart: React.FC<StatusChartProps> = ({ statusCounts }) => {
  const options = {
    chart: {
      type: 'pie',
      plotBackgroundColor: '#121212',
      plotBorderWidth: 0,
      plotShadow: false,
      backgroundColor: '#121212',
    },
    title: {
      text: 'Task Status',
      align: 'center',
      verticalAlign: 'middle',
      y: 60,
      style: {
        color: '#FFF',
      },
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 90,
        center: ['50%', '75%'],
        size: '100%',
        innerSize: '50%',
        dataLabels: {
          enabled: true,
          distance: -30,
          color: '#FFF',
        },
      },
    },
    series: [
      {
        type: 'pie',
        name: 'Task Count',
        data: [
          ['Pending', statusCounts[status.PENDING] || 0],
          ['Doing', statusCounts[status.DOING] || 0],
          ['Done', statusCounts[status.DONE] || 0],
          ['Warning', statusCounts[status.WARNING] || 0],
        ],
        colorByPoint: true,
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default StatusChart;
