import React from 'react';
import Chart from 'react-apexcharts';
import useIsMobile from '../hooks/useIsMobile';

const ChartCard = ({ options, series, legendData, type = 'bar', height = 350 }) => {
    const isMobile = useIsMobile(764);
    const safeSeries = Array.isArray(series) ? series : [];
    const safeLegend = Array.isArray(legendData) ? legendData : [];

    const currentOptions = options || {};
    const chartOptions = {
        ...currentOptions,
        legend: {
            ...(currentOptions.legend || {}),
            position: isMobile ? 'top' : (currentOptions.legend?.position || 'bottom')
        },
        plotOptions: {
            ...(currentOptions.plotOptions || {}),
            bar: {
                ...(currentOptions.plotOptions?.bar || {}),
                horizontal: isMobile ? false : currentOptions.plotOptions?.bar?.horizontal,
                columnWidth: isMobile ? '25px' : currentOptions.plotOptions?.bar?.columnWidth
            }
        }
    };

    return (
        <div className="col-xl-12">
            <div className="card">
                <div className="card-body">
                    <div style={{ minHeight: '365px' }}>
                        <Chart
                            options={chartOptions}
                            series={safeSeries}
                            type={type}
                            height={height}
                        />
                    </div>
                    <div className="row row5 align-self-center text-center">
                        {safeLegend.map((item, index) => (
                            <div key={index} className={item.columnClass || 'col-4 col-sm'}>
                                <p className="mb-2 font-size-11">
                                    <i className={`mdi mdi-circle align-middle font-size-10 me-2 ${item.colorClass}`}></i>
                                    {item.label}
                                </p>
                                <h5>{item.value}</h5>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChartCard;
