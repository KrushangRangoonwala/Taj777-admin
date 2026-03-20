import React from 'react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';

const Dashboard = () => {
    const stats = [
        { title: 'Balance', value: '58,900' },
        { title: 'Exposure', value: '0' },
        { title: 'Credit pts', value: '1,00,000' },
        { title: 'All pts', value: '79,859.75' },
        { title: 'Settlement pts', value: '-20,140.25' },
        { title: 'Upper pts', value: '0' },
        { title: 'Down pts', value: '-15,000' },
    ];

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

    const chart1Series = [{
        name: 'Points',
        data: [100000, 79859.75, -20140.25, 0, -15000]
    }];

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

    const chart2Series = [{
        name: 'Profit/Loss',
        data: [2047, 18093.25, 0, 20140.25]
    }];

    const chart1LegendData = [
        { label: 'Credit pts', value: '1,00,000', colorClass: 'text-primary', columnClass: 'col-6 col-sm' },
        { label: 'All pts', value: '79,859.75', colorClass: 'text-warning', columnClass: 'col-6 col-sm' },
        { label: 'Settlement pts', value: '-20,140.25', colorClass: 'text-info', columnClass: 'col-4 col-sm' },
        { label: 'Upper pts', value: '0', colorClass: 'text-success', columnClass: 'col-4 col-sm' },
        { label: 'Down pts', value: '-15,000', colorClass: 'text-dark', columnClass: 'col-4 col-sm' },
    ];

    const chart2LegendData = [
        { label: 'Sports P/L', value: '2,047', colorClass: 'text-primary', columnClass: 'col-6 col-sm' },
        { label: 'Casino P/L', value: '18,093.25', colorClass: 'text-warning', columnClass: 'col-6 col-sm' },
        { label: 'Tp Casino P/L', value: '0', colorClass: 'text-info', columnClass: 'col-4 col-sm' },
        { label: 'Total P/L', value: '20,140.25', colorClass: 'text-success', columnClass: 'col-4 col-sm' },
    ];

    const casinoGames = [
        { href: '/admin/casino/worli3', src: 'https://sitethemedata.com/casino_icons/lc/worli3.gif' },
        { href: '/admin/casino/teen62', src: 'https://sitethemedata.com/casino_icons/lc/teen62.gif' },
        { href: '/admin/casino/dolidana', src: 'https://sitethemedata.com/casino_icons/lc/dolidana.gif' },
        { href: '/admin/casino/mogambo', src: 'https://sitethemedata.com/casino_icons/lc/mogambo.gif' },
        { href: '/admin/casino/lucky5', src: 'https://sitethemedata.com/casino_icons/lc/lucky5.jpg' },
        { href: '/admin/casino/roulette12', src: 'https://sitethemedata.com/casino_icons/lc/roulette12.jpg' },
        { href: '/admin/casino/roulette13', src: 'https://sitethemedata.com/casino_icons/lc/roulette13.jpg' },
        { href: '/admin/casino/roulette11', src: 'https://sitethemedata.com/casino_icons/lc/roulette11.jpg' },
        { href: '/admin/casino/poison', src: 'https://sitethemedata.com/casino_icons/lc/poison.jpg' },
        { href: '/admin/casino/teenunique', src: 'https://sitethemedata.com/casino_icons/lc/teenunique.jpg' },
        { href: '/admin/casino/worli3', src: 'https://sitethemedata.com/casino_icons/lc/worli3.gif' },
        { href: '/admin/casino/teen62', src: 'https://sitethemedata.com/casino_icons/lc/teen62.gif' },
        { href: '/admin/casino/dolidana', src: 'https://sitethemedata.com/casino_icons/lc/dolidana.gif' },
        { href: '/admin/casino/mogambo', src: 'https://sitethemedata.com/casino_icons/lc/mogambo.gif' },
        { href: '/admin/casino/lucky5', src: 'https://sitethemedata.com/casino_icons/lc/lucky5.jpg' },
        { href: '/admin/casino/roulette12', src: 'https://sitethemedata.com/casino_icons/lc/roulette12.jpg' },
        { href: '/admin/casino/roulette13', src: 'https://sitethemedata.com/casino_icons/lc/roulette13.jpg' },
        { href: '/admin/casino/roulette11', src: 'https://sitethemedata.com/casino_icons/lc/roulette11.jpg' },
        { href: '/admin/casino/poison', src: 'https://sitethemedata.com/casino_icons/lc/poison.jpg' },
        { href: '/admin/casino/teenunique', src: 'https://sitethemedata.com/casino_icons/lc/teenunique.jpg' },
        { href: '/admin/casino/worli3', src: 'https://sitethemedata.com/casino_icons/lc/worli3.gif' },
        { href: '/admin/casino/teen62', src: 'https://sitethemedata.com/casino_icons/lc/teen62.gif' },
        { href: '/admin/casino/dolidana', src: 'https://sitethemedata.com/casino_icons/lc/dolidana.gif' },
        { href: '/admin/casino/mogambo', src: 'https://sitethemedata.com/casino_icons/lc/mogambo.gif' },
        { href: '/admin/casino/lucky5', src: 'https://sitethemedata.com/casino_icons/lc/lucky5.jpg' },
        { href: '/admin/casino/roulette12', src: 'https://sitethemedata.com/casino_icons/lc/roulette12.jpg' },
        { href: '/admin/casino/roulette13', src: 'https://sitethemedata.com/casino_icons/lc/roulette13.jpg' },
        { href: '/admin/casino/roulette11', src: 'https://sitethemedata.com/casino_icons/lc/roulette11.jpg' },
        { href: '/admin/casino/poison', src: 'https://sitethemedata.com/casino_icons/lc/poison.jpg' },
        { href: '/admin/casino/teenunique', src: 'https://sitethemedata.com/casino_icons/lc/teenunique.jpg' },
        { href: '/admin/casino/worli3', src: 'https://sitethemedata.com/casino_icons/lc/worli3.gif' },
        { href: '/admin/casino/teen62', src: 'https://sitethemedata.com/casino_icons/lc/teen62.gif' },
        { href: '/admin/casino/dolidana', src: 'https://sitethemedata.com/casino_icons/lc/dolidana.gif' },
        { href: '/admin/casino/mogambo', src: 'https://sitethemedata.com/casino_icons/lc/mogambo.gif' },
        { href: '/admin/casino/lucky5', src: 'https://sitethemedata.com/casino_icons/lc/lucky5.jpg' },
        { href: '/admin/casino/roulette12', src: 'https://sitethemedata.com/casino_icons/lc/roulette12.jpg' },
        { href: '/admin/casino/roulette13', src: 'https://sitethemedata.com/casino_icons/lc/roulette13.jpg' },
        { href: '/admin/casino/roulette11', src: 'https://sitethemedata.com/casino_icons/lc/roulette11.jpg' },
        { href: '/admin/casino/poison', src: 'https://sitethemedata.com/casino_icons/lc/poison.jpg' },
        { href: '/admin/casino/teenunique', src: 'https://sitethemedata.com/casino_icons/lc/teenunique.jpg' },
        { href: '/admin/casino/worli20', src: 'https://sitethemedata.com/casino_icons/lc/poison20.jpg' },
        { href: '/admin/casino/joker120', src: 'https://sitethemedata.com/casino_icons/lc/joker120.jpg' },
        { href: '/admin/casino/joker20', src: 'https://sitethemedata.com/casino_icons/lc/joker20.jpg' },
        { href: '/admin/casino/joker1', src: 'https://sitethemedata.com/casino_icons/lc/joker1.jpg' },
        { href: '/admin/casino/teen20c', src: 'https://sitethemedata.com/casino_icons/lc/teen20c.jpg' },
        { href: '/admin/casino/btable2', src: 'https://sitethemedata.com/casino_icons/lc/btable2.jpg' },
        { href: '/admin/casino/ourroullete', src: 'https://sitethemedata.com/casino_icons/lc/ourroullete.jpg' },
        { href: '/admin/casino/superover3', src: 'https://sitethemedata.com/casino_icons/lc/superover3.jpg' },
        { href: '/admin/casino/goal', src: 'https://sitethemedata.com/casino_icons/lc/goal.jpg' },
        { href: '/admin/casino/ab4', src: 'https://sitethemedata.com/casino_icons/lc/ab4.jpg' },
        { href: '/admin/casino/lucky15', src: 'https://sitethemedata.com/casino_icons/lc/lucky15.jpg' },
        { href: '/admin/casino/superover2', src: 'https://sitethemedata.com/casino_icons/lc/superover2.jpg' },
        { href: '/admin/casino/teen41', src: 'https://sitethemedata.com/casino_icons/lc/teen41.jpg' },
        { href: '/admin/casino/teen42', src: 'https://sitethemedata.com/casino_icons/lc/teen42.jpg' },
        { href: '/admin/casino/sicbo2', src: 'https://sitethemedata.com/casino_icons/lc/sicbo2.jpg' },
        { href: '/admin/casino/teen33', src: 'https://sitethemedata.com/casino_icons/lc/teen33.jpg' },
        { href: '/admin/casino/sicbo', src: 'https://sitethemedata.com/casino_icons/lc/sicbo.jpg' },
        { href: '/admin/casino/ballbyball', src: 'https://sitethemedata.com/casino_icons/lc/ballbyball.jpg' },
        { href: '/admin/casino/teen32', src: 'https://sitethemedata.com/casino_icons/lc/teen32.jpg' },
        { href: '/admin/casino/teen', src: 'https://sitethemedata.com/casino_icons/lc/teen.jpg' },
    ];

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
                                                            <a href={game.href} className="">
                                                                <img
                                                                    className="img-fluid"
                                                                    data-src={game.src}
                                                                    src={game.src}
                                                                    lazy={index === 0 ? "loaded" : "loading"}
                                                                />
                                                            </a>
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
