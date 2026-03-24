import React from 'react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

const MarketAnalysis = () => {
    const marketData = [
        {
            id: 1,
            title: "Indian Premier League",
            link: "/admin/game/details/SeK7puKGhm+IDlF%2FzygDVg==/DYTXxH0ZjsIP6DMfL%2FpBCw==",
            dateTime: "28/03/2026 19:30:00",
            marketTitle: "IPL Cup Winner Bookmaker",
            teams: [
                { name: "Mumbai Indians", value: "77.5" },
                { name: "Royal Challengers Bengaluru", value: "-441.75" },
                { name: "Chennai Super Kings", value: "77.5" },
                { name: "Sunrisers Hyderabad", value: "77.5" },
                { name: "Delhi Capitals", value: "77.5" },
                { name: "Punjab Kings", value: "77.5" },
                { name: "Gujarat Titans", value: "77.5" },
                { name: "Lucknow Super Giants", value: "77.5" },
                { name: "Kolkata Knight Riders", value: "77.5" },
                { name: "Rajasthan Royals", value: "77.5" },
            ]
        },
        {
            id: 2,
            title: "Li Tu v Overbeck",
            link: "/admin/game/details/ZMsVdzACxXZhtFWzJX9BDA==/1syNqHyxELKYUWSTAssMDw==",
            dateTime: "24/03/2026 09:45:00",
            marketTitle: "MATCH_ODDS",
            teams: [
                { name: "Li Tu", value: "-186" },
                { name: "Carl Emil Overbeck", value: "77.5" },
            ]
        },
        {
            id: 3,
            title: "Max Jones v Uchiyama",
            link: "/admin/game/details/ZMsVdzACxXZhtFWzJX9BDA==/%2F1adoPIDLG09cAOPxf6UjA==",
            dateTime: "24/03/2026 09:30:00",
            marketTitle: "MATCH_ODDS",
            teams: [
                { name: "Maximus Jones", value: "-410.75" },
                { name: "Yasutaka Uchiyama", value: "98.43" },
            ]
        }
    ];

    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="market-analysis">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-flex align-items-center justify-content-between">
                            <h4 className="mb-0 font-size-18">
                                Market Analysis
                                <a href="javascript:void(0)" title="Refresh Data" className="text-dark pl-2">
                                    <i className="fa fa-sync"></i>
                                </a>
                            </h4>
                            <div className="page-title-right">
                                <input
                                    type="text"
                                    name="searchMarktetText"
                                    defaultValue=""
                                    placeholder="Search Event"
                                    className="form-control"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="market-analysis-container">
                    {marketData.map((market) => (
                        <div key={market.id} className="market-analysis-container">
                            <div className="market-analysis-title">
                                <div>
                                    <a href={market.link} className="ma-link">
                                        {market.title}
                                    </a>
                                </div>
                                <div>{market.dateTime}</div>
                            </div>
                            <div className="market-analysis-content">
                                <div className="row row5">
                                    <div className="col-lg-4">
                                        <SimpleBar
                                            className="market-analysis-content-detail"
                                            style={{ maxHeight: '250px' }}
                                        >
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th colSpan="2">{market.marketTitle}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {market.teams.map((team, index) => (
                                                        <tr key={team.name + index}>
                                                            <td>{team.name}</td>
                                                            <td className="text-right">{team.value}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </SimpleBar>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MarketAnalysis;
