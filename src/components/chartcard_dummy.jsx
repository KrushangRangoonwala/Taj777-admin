import React from 'react';
import Chart from 'react-apexcharts';

const ChartCard = ({ options, series, legendData }) => {

    const safeSeries = Array.isArray(series) ? series : [];
    const safeLegend = Array.isArray(legendData) ? legendData : [];

    return (
        <div className="col-xl-12">

            <Chart
                options={options || {}}
                series={safeSeries}
                type="bar"
                height={350}
            />

            {/* LEGEND SAFE RENDER */}
            <div className="row mt-3">
                {safeLegend.map((item, index) => (
                    <div key={index} className={item.columnClass || "col-6"}>
                        <div className={item.colorClass}>
                            {item.label}: <b>{item.value}</b>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default ChartCard;
