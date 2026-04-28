import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { fetchCasinoList } from '../api/API_games';
import { fetchDashboard } from '../api/API';
import { gameCodeMap } from '../utilies/helpers';
import { Link } from 'react-router-dom';

const legendStruc = [
    { label: '', value: '', colorClass: 'text-primary', columnClass: 'col-6 col-sm' },
    { label: '', value: '', colorClass: 'text-warning', columnClass: 'col-6 col-sm' },
    { label: '', value: '', colorClass: 'text-info', columnClass: 'col-4 col-sm' },
    { label: '', value: '', colorClass: 'text-success', columnClass: 'col-4 col-sm' },
    { label: '', value: '', colorClass: 'text-dark', columnClass: 'col-4 col-sm' },
]


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
        showForSingleSeries: true,
        customLegendItems: ['Credit pts', 'All pts', 'Settlement pts', 'Upper pts', 'Down pts'],
        markers: {
            radius: 0
        },
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
        showForSingleSeries: true,
        customLegendItems: ['Sports P/L', 'Casino P/L', 'Third Party Casino P/L', 'Total P/L'],
        markers: {
            radius: 0
        },
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
    const casino_list = useSelector(store => store.casino.casino_list);
    const userData = useSelector(store => store.user.userData);
    const user_type = userData?.user_type;

    const [stats, setStats] = useState([]);

    const [chart1Series, setChart1Series] = useState([]);
    const [chart2Series, setChart2Series] = useState([]);

    const [chart1LegendData, setChart1LegendData] = useState(legendStruc);
    const [chart2LegendData, setChart2LegendData] = useState(legendStruc.slice(0, 4));

    function setLegendData({ setState, ...data }) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        let legendData = keys.map((val, idx) => {
            return {
                ...legendStruc[idx],
                label: val,
                value: formatNumber(values[idx]),
            }
        })

        setState(legendData)
    }

    const formatNumber = (num) => {
        return Number(num || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const dashResponse = await fetchDashboard();

                if (dashResponse?.status === 'ok' && dashResponse?.data) {
                    const data = dashResponse.data;

                    // ================= STATS =================
                    if (data.stats) {
                        setStats(
                            data.stats.map(item => ({
                                title: item.title,
                                value: formatNumber(item.value)
                            }))
                        );
                    }

                    if (data.points_chart?.series) {
                        setChart1Series(data.points_chart.series);

                        // setChart1Options(prev => ({
                        //     ...prev,
                        //     xaxis: { categories: data.points_chart.categories }
                        // }));
                        const qqq = data.points_chart.categories.reduce((acc, val, idx) => {
                            acc[val] = data.points_chart.series[0].data[idx];
                            return acc;
                        }, {});
                        setLegendData({ setState: setChart1LegendData, ...qqq })
                    }

                    if (data.profit_loss_chart?.series) {
                        setChart2Series(data.profit_loss_chart.series);

                        // setChart2Options(prev => ({
                        //     ...prev,
                        //     xaxis: { categories: data.profit_loss_chart.categories }
                        // }));

                        const qqq = data.profit_loss_chart.categories.reduce((acc, val, idx) => {
                            acc[val] = data.profit_loss_chart.series[0].data[idx];
                            return acc;
                        }, {});
                        setLegendData({ setState: setChart2LegendData, ...qqq })
                    }
                }
            } catch (error) {
                console.error('Dashboard Error:', error);
            }
        };

        const getCasinoGames = async () => {
            try {
                const response = await fetchCasinoList();

                if (response?.status === 'ok' && response?.all_data) {
                    const mappedGames = response.all_data.map(game => ({
                        href: `/admin/casino/${gameCodeMap[game.game_code] ?? game.game_code}`,
                        src: game.game_image,
                        alt: game.game_name
                    }));

                    setCasinoGames(mappedGames);
                }
            } catch (error) {
                console.error(error);
            }
        };

        loadDashboardData();
        getCasinoGames();
    }, []);

    return (
        <div className="p-1">

            {/* ================= STATS ================= */}
            <div className="row row5">
                {stats.map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                    />
                ))}
            </div>

            {/* ================= CHARTS ================= */}
            {/* {user_type == '4' && */}
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
            {/* } */}

            {/* ================= CASINO ================= */}
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
                                                {casino_list && Object.values(casino_list).filter(val => val.game_code !== "teen20v1").map((game, index) => (
                                                    <div key={index} className="casino-banner-item">
                                                        <Link to={`/admin/casino/${gameCodeMap[game.game_code] ?? game.game_code}`} className="">
                                                            <img
                                                                className="img-fluid"
                                                                alt={game.game_name}
                                                                data-src={game.game_image}
                                                                src={game.game_image}
                                                                lazy={index === 0 ? "loaded" : "loading"}
                                                            />
                                                        </Link>
                                                    </div>
                                                ))}
                                                {/* {casinoGames.filter(val => val.game_code !== "teen20v1").map((game, index) => (
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
                                                ))} */}
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
    );
};

export default Dashboard;

// Arpit6666
// Arpit@6666
// Arpit5555
// Arpit@5555