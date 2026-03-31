import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { fetchCasinoList, fetchDashboardData } from '../api/API';
import { gameCodeMap } from '../utilies/helpers';
import { Link } from 'react-router-dom';

const chart1Options = {
    chart: {
        type: 'bar',
        height: 350,
        toolbar: {
            show: true
        }
    },
    plotOptions: {
        bar: {
            horizontal: true,
            distributed: true,
            barHeight: '65%',
        }
    },
    dataLabels: {
        enabled: false
    },
    colors: ['#556ee6', '#f1b44c', '#50a5f1', '#34c38f', '#343a40'],
    xaxis: {
        categories: ['Credit pts', 'All pts', 'Settlement pts', 'Upper pts', 'Down pts'],
    },
    legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return val.toLocaleString();
            }
        }
    }
};

const chart2Options = {
    chart: {
        type: 'bar',
        height: 350,
        toolbar: {
            show: true
        }
    },
    plotOptions: {
        bar: {
            horizontal: true,
            distributed: true,
            barHeight: '45%',
        }
    },
    dataLabels: {
        enabled: false
    },
    colors: ['#556ee6', '#f1b44c', '#50a5f1', '#34c38f'],
    xaxis: {
        categories: ['Sports P/L', 'Casino P/L', 'Third Party Casino P/L', 'Total P/L'],
    },
    legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return val.toLocaleString();
            }
        }
    }
};

const Dashboard = () => {
    const [casinoGames, setCasinoGames] = useState([]);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState([
        { title: 'Balance', value: '58,900' },
        { title: 'Exposure', value: '0' },
        { title: 'Credit pts', value: '1,00,000' },
        { title: 'All pts', value: '79,859.75' },
        { title: 'Settlement pts', value: '-20,140.25' },
        { title: 'Upper pts', value: '0' },
        { title: 'Down pts', value: '-15,000' },
    ]);

    const [chart1Series, setChart1Series] = useState([{
        name: 'Points',
        data: [100000, 79859.75, -20140.25, 0, -15000]
    }]);

    const [chart2Series, setChart2Series] = useState([{
        name: 'Profit/Loss',
        data: [2047, 18093.25, 0, 20140.25]
    }]);

    const [chart1LegendData, setChart1LegendData] = useState([
        { label: 'Credit pts', value: '1,00,000', colorClass: 'text-primary', columnClass: 'col-6 col-sm' },
        { label: 'All pts', value: '79,859.75', colorClass: 'text-warning', columnClass: 'col-6 col-sm' },
        { label: 'Settlement pts', value: '-20,140.25', colorClass: 'text-info', columnClass: 'col-4 col-sm' },
        { label: 'Upper pts', value: '0', colorClass: 'text-success', columnClass: 'col-4 col-sm' },
        { label: 'Down pts', value: '-15,000', colorClass: 'text-dark', columnClass: 'col-4 col-sm' },
    ]);

    const [chart2LegendData, setChart2LegendData] = useState([
        { label: 'Sports P/L', value: '2,047', colorClass: 'text-primary', columnClass: 'col-6 col-sm' },
        { label: 'Casino P/L', value: '18,093.25', colorClass: 'text-warning', columnClass: 'col-6 col-sm' },
        { label: 'Tp Casino P/L', value: '0', colorClass: 'text-info', columnClass: 'col-4 col-sm' },
        { label: 'Total P/L', value: '20,140.25', colorClass: 'text-success', columnClass: 'col-4 col-sm' },
    ]);


    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Fetch Dashboard Stats & Charts if API exists
                const dashResponse = await fetchDashboardData();
                if (dashResponse && dashResponse.status === 'ok' && dashResponse.data) {
                    const { data } = dashResponse;
                    if (data.stats) setStats(data.stats);
                    if (data.points_chart) {
                        setChart1Series(data.points_chart.series);
                        if (data.points_chart.categories) {
                            // Update categories logic if needed, but categories are currently in chartOptions
                        }
                    }
                    if (data.profit_loss_chart) {
                        setChart2Series(data.profit_loss_chart.series);
                    }
                    // Update legends if provided by API, otherwise they stay static
                    if (data.chart1_legend) setChart1LegendData(data.chart1_legend);
                    if (data.chart2_legend) setChart2LegendData(data.chart2_legend);
                }
            } catch (error) {
                console.error('Error fetching dynamic dashboard data:', error);
                // Fallback to static data (already initialized in state)
            } finally {
                setLoading(false);
            }
        };

        const getCasinoGames = async () => {
            try {
                const response = await fetchCasinoList();
                if (response.status === 'ok' && response.all_data) {
                    const mappedGames = response.all_data.map(game => ({
                        href: `/admin/casino/${gameCodeMap[game.game_code] ?? game.game_code}`,
                        src: game.game_image,
                        alt: game.game_name
                    }));
                    setCasinoGames(mappedGames);
                }
            } catch (error) {
                console.error('Error fetching casino list for dashboard:', error);
            }
        };

        // loadDashboardData();
        getCasinoGames();
    }, []);


    return (
        <div>
            <div className="p-1">
                <div className="row row5">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            valueClass={stat.valueClass}
                        />
                    ))}
                </div>

                <div className="row">
                    <ChartCard
                        options={chart1Options}
                        series={chart1Series}
                        legendData={chart1LegendData}
                    />

                    <ChartCard
                        options={chart2Options}
                        series={chart2Series}
                        legendData={chart2LegendData}
                    />
                </div>

                <div className="row">
                    <div className="col-12">
                        <h4 className="sport-list-title pl-2">Our Live Casino</h4>
                        <div data-simplebar="init" style={{ maxHeight: '470px' }}>
                            <div className="simplebar-wrapper" style={{ margin: '0px' }}>
                                <div className="simplebar-height-auto-observer-wrapper">
                                    <div className="simplebar-height-auto-observer"></div>
                                </div>
                                <div className="simplebar-mask">
                                    <div className="simplebar-offset" style={{ right: '0px', bottom: '0px' }}>
                                        <div className="simplebar-content-wrapper" tabIndex="0" role="region"
                                            aria-label="scrollable content"
                                            style={{ height: 'auto', overflow: 'hidden scroll' }}>
                                            <div className="simplebar-content" style={{ padding: '0px' }}>
                                                <div className="casino-banners">
                                                    {casinoGames.map((game, index) => (
                                                        <div key={index} className="casino-banner-item">
                                                            <Link to={game.href} className="">
                                                                <img
                                                                    className="img-fluid"
                                                                    alt={game.alt}
                                                                    data-src={game.src}
                                                                    src={game.src}
                                                                    lazy={index === 0 ? "loaded" : "loading"}
                                                                />
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="simplebar-placeholder" style={{ width: 'auto', height: '2283px' }}>
                                </div>
                            </div>
                            <div className="simplebar-track simplebar-horizontal" style={{ visibility: 'hidden' }}>
                                <div className="simplebar-scrollbar" style={{ width: '0px', display: 'none' }}></div>
                            </div>
                            <div className="simplebar-track simplebar-vertical" style={{ visibility: 'visible' }}>
                                <div className="simplebar-scrollbar"
                                    style={{ height: '96px', display: 'block', transform: 'translate3d(0px, 0px, 0px)' }}>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;


// for admin dashboard - expected backend api response format

// {
//     "status": "ok",
//         "data": {
//         "stats": [
//             { "title": "Balance", "value": "58,900" },
//             { "title": "Exposure", "value": "0" },
//             { "title": "Credit pts", "value": "1,00,000" },
//             { "title": "All pts", "value": "79,859.75" },
//             { "title": "Settlement pts", "value": "-20,140.25" },
//             { "title": "Upper pts", "value": "0" },
//             { "title": "Down pts", "value": "-15,000" }
//         ],
//             "points_chart": {
//             "categories": ["Credit pts", "All pts", "Settlement pts", "Upper pts", "Down pts"],
//                 "series": [
//                     {
//                         "name": "Points",
//                         "data": [100000, 79859.75, -20140.25, 0, -15000]
//                     }
//                 ]
//         },
//         "profit_loss_chart": {
//             "categories": ["Sports P/L", "Casino P/L", "Third Party Casino P/L", "Total P/L"],
//                 "series": [
//                     {
//                         "name": "Profit/Loss",
//                         "data": [2047, 18093.25, 0, 20140.25]
//                     }
//                 ]
//         }
//     }
// }