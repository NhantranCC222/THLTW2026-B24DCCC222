import Chart from 'react-apexcharts';

export default () => {
  const options = {
    chart: { id: 'basic-bar' },
    xaxis: { categories: ['IT'] }
  };

  const series = [
    { name: 'Approved', data: [10] },
    { name: 'Rejected', data: [2] },
    { name: 'Pending', data: [5] }
  ];

  return <Chart options={options} series={series} type="bar" />;
};