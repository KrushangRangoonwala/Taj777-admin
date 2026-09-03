import React from 'react';
import Chart from 'react-apexcharts';
import useIsMobile from '../hooks/useIsMobile';

const ChartCard = ({ options, series, legendData, type = 'bar', height = 350 }) => {
    const isMobile = useIsMobile(764);
    const safeSeries = Array.isArray(series) ? series : [];
    const safeLegend = Array.isArray(legendData) ? legendData : [];

    // Adjust series for visual rendering with a minimum floor for non-zero values
    const adjustedSeries = safeSeries.map(s => {
        if (!s || !Array.isArray(s.data)) return s;
        
        const rawData = s.data;
        // Find absolute maximum value in the data
        const maxVal = Math.max(...rawData.map(v => Math.abs(Number(v || 0))).filter(v => !isNaN(v)), 0);
        const minThreshold = maxVal > 0 ? maxVal * 0.02 : 0; // 2% minimum threshold
        
        const visualData = rawData.map(val => {
            const numVal = Number(val || 0);
            if (numVal === 0 || isNaN(numVal)) return val;
            
            const sign = numVal < 0 ? -1 : 1;
            const absVal = Math.abs(numVal);
            const adjustedAbs = Math.max(absVal, minThreshold);
            return sign * adjustedAbs;
        });

        return {
            ...s,
            data: visualData
        };
    });

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
        },
        tooltip: {
            ...(currentOptions.tooltip || {}),
            y: {
                ...(currentOptions.tooltip?.y || {}),
                formatter: function (val, opts) {
                    const { seriesIndex, dataPointIndex } = opts;
                    const origSeries = safeSeries[seriesIndex];
                    if (origSeries && Array.isArray(origSeries.data)) {
                        const origVal = origSeries.data[dataPointIndex];
                        if (origVal !== undefined) {
                            if (currentOptions.tooltip?.y?.formatter) {
                                return currentOptions.tooltip.y.formatter(origVal, opts);
                            }
                            return typeof origVal === 'number' 
                                ? origVal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) 
                                : origVal;
                        }
                    }
                    return val;
                }
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
                            series={adjustedSeries}
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
