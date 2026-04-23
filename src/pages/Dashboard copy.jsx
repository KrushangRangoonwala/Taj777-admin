import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { fetchCasinoList } from '../api/API_games';
import { fetchDashboard } from '../api/API';
import { gameCodeMap } from '../utilies/helpers';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [casinoGames, setCasinoGames] = useState([]);

    const [stats, setStats] = useState([]);

    const [chart1Series, setChart1Series] = useState([]);
    const [chart2Series, setChart2Series] = useState([]);

    const [chart1Options, setChart1Options] = useState({
        chart: { type: 'bar', height: 350, toolbar: { show: true } },
        plotOptions: {
            bar: {
                horizontal: true,
                distributed: true,
                barHeight: '65%',
            }
        },
        dataLabels: { enabled: false },
        colors: ['#556ee6', '#f1b44c', '#50a5f1', '#34c38f', '#343a40'],
        xaxis: { categories: [] },
        legend: {
            show: true,
            position: 'bottom',
            horizontalAlign: 'center',
        },
        tooltip: {
            y: {
                formatter: (val) => Number(val).toLocaleString()
            }
        }
    });

    const [chart2Options, setChart2Options] = useState({
        chart: { type: 'bar', height: 350, toolbar: { show: true } },
        plotOptions: {
            bar: {
                horizontal: true,
                distributed: true,
                barHeight: '45%',
            }
        },
        dataLabels: { enabled: false },
        colors: ['#556ee6', '#f1b44c', '#50a5f1', '#34c38f'],
        xaxis: { categories: [] },
        legend: {
            show: true,
            position: 'bottom',
            horizontalAlign: 'center',
        },
        tooltip: {
            y: {
                formatter: (val) => Number(val).toLocaleString()
            }
        }
    });

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

                    // ================= CHART 1 =================
                    if (data.points_chart?.series) {
                        const categories = [
                            'Credit pts',
                            'All pts',
                            'Settlement pts',
                            'Upper pts',
                            'Down pts'
                        ];

                        setChart1Series(data.points_chart.series);

                        setChart1Options(prev => ({
                            ...prev,
                            xaxis: { categories }
                        }));
                    }

                    // ================= CHART 2 =================
                    if (data.profit_loss_chart?.series) {
                        const categories = [
                            'Sports P/L',
                            'Casino P/L',
                            'Third Party Casino P/L',
                            'Total P/L'
                        ];

                        setChart2Series(data.profit_loss_chart.series);

                        setChart2Options(prev => ({
                            ...prev,
                            xaxis: { categories }
                        }));
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
            <div className="row">
                <ChartCard
                    options={chart1Options}
                    series={chart1Series}
                />

                <ChartCard
                    options={chart2Options}
                    series={chart2Series}
                />
            </div>

            {/* ================= CASINO ================= */}
            <div className="row">
                <div className="col-12">
                    <h4 className="sport-list-title pl-2">Our Live Casino</h4>

                    <div data-simplebar="init" style={{ maxHeight: '470px' }}>
                        <div className="casino-banners">
                            {casinoGames.map((game, index) => (
                                <div key={index} className="casino-banner-item">
                                    <Link to={game.href}>
                                        <img
                                            className="img-fluid"
                                            alt={game.alt}
                                            src={game.src}
                                        />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Dashboard;