import React, { useEffect, useState } from 'react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { getMarketPage_Exposure } from '../../api/API';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSelectedMatch } from '../../store/slices/matchSlice';

const MarketAnalysis = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const liveDataBySport = useSelector((state) => state.match.liveDataBySport);
    const [marketExp, setMarketExp] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    async function getMarketExposure(isLoading = false) {
        isLoading ? setLoading(true) : setLoading(false); // SHOW LOADER ONLY ON 1ST RENDER, otherwise hide it
        try {
            const res = await getMarketPage_Exposure();
            setMarketExp(res?.results || []);
        } finally {
            isLoading ? setLoading(false) : setLoading(false);
        }
    }

    useEffect(() => {
        getMarketExposure(true);
        const intervalId = setInterval(getMarketExposure, 10000);

        return () => clearInterval(intervalId);
    }, [])

    const filteredEvents = marketExp.filter(event =>
        event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleMatchClick = (match) => {
        var selected = null;
        Object.values(liveDataBySport).forEach(sport => sport.sportData.body.forEach(m => {
            if (m.matchid == match.event_id && m.marketid == match.oddsmarketId) {
                selected = m;
            }
        }))

        console.log('match', match)
        console.log('selected', selected);
        // console.log('liveDataBySport', liveDataBySport)

        const aaa = {
            marketid: match.oddsmarketId,
            matchName: match.event_name,
            SportId: match.event_type,
            // matchdate
            // inPlay
        }
        const selectedMatch = selected || { ...match, ...aaa }
        // console.log('selectedMatch', selectedMatch);
        sessionStorage.setItem('selectedMatch', JSON.stringify(selectedMatch));
        dispatch(setSelectedMatch(selectedMatch));

        setTimeout(() => {
            navigate(`/admin/game/${selectedMatch.SportId}`, { state: { match: selectedMatch } });
        }, 500);
    };


    return (
        <div data-v-5a10e370="">
            <div data-v-5a10e370="" className="market-analysis">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-flex align-items-center justify-content-between">
                            <h4 className="mb-0 font-size-18">
                                Market Analysis
                                <a
                                    href="javascript:void(0)"
                                    title="Refresh Data"
                                    className={`text-dark pl-2 ${loading ? 'fa-spin' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        getMarketExposure(true);
                                    }}
                                >
                                    <i className="fa fa-sync"></i>
                                </a>
                            </h4>
                            <div className="page-title-right">
                                <input
                                    type="text"
                                    name="searchMarktetText"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search Event"
                                    className="form-control dark-placeholder"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="market-analysis-container">
                    {loading ? (
                        <div className="text-center p-5">
                            <i className="fa fa-spinner fa-spin fa-2x"></i>
                            <div className="mt-2">Loading data...</div>
                        </div>
                    ) : filteredEvents && filteredEvents.length > 0 ? (
                        filteredEvents.map((event, eventIdx) => {
                            // Group market_pl by market_type
                            const groupedMarkets = event.market_pl.reduce((acc, curr) => {
                                if (!acc[curr.market_type]) {
                                    acc[curr.market_type] = [];
                                }
                                acc[curr.market_type].push(curr);
                                return acc;
                            }, {});

                            return (
                                <div key={event.event_id || eventIdx} className="market-analysis-container">
                                    <div className="market-analysis-title">
                                        <div>
                                            <Link onClick={() => handleMatchClick(event)} className="ma-link">
                                                {event.event_name}
                                            </Link>
                                        </div>
                                        <div>
                                            {/* TIME */}
                                        </div>
                                    </div>
                                    <div className="market-analysis-content">
                                        <div className="row row5">
                                            {Object.entries(groupedMarkets).map(([marketType, markets], groupIdx) => (
                                                <div key={marketType + groupIdx} className="col-lg-4">
                                                    <SimpleBar
                                                        className="market-analysis-content-detail"
                                                        style={{ maxHeight: '250px' }}
                                                    >
                                                        <table className="table">
                                                            <thead>
                                                                <tr>
                                                                    <th colSpan="2">{marketType}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {markets.map((m, mIdx) => (
                                                                    <tr key={m.market_id || mIdx}>
                                                                        <td>{m.market_name}</td>
                                                                        <td className={`text-right ${m.pl >= 0 ? 'text-success' : 'text-danger'}`}>
                                                                            {m.pl}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </SimpleBar>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : <></>}
                </div>
            </div>
        </div>
    );
};

export default MarketAnalysis;
