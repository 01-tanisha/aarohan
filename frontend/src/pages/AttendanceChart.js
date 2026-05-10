import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

function AttendanceChart({ present, absent }) {
  const total = present + absent;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  const data = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        data: [present, absent],
        backgroundColor: ["#4CAF50", "#F44336"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    cutout: "0%",   
  };

  return (
    <div style={{ position: "relative", width: "180px", height: "180px", margin: "auto" }}>
      <Pie data={data} options={options} />

    </div>
  );
}

export default AttendanceChart;
