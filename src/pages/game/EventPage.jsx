import React from 'react';
import { MarketTable, MarketRow, FancyMarketRow } from './components/MarketComponents';
import { MyBetsSidebar } from './components/Sidebars';

const EventPage = () => {
    return (
        <div className="detail-page-container">
            <div className="center-main-container">
                <div className="center-content">
                    {/* Game Header */}
                    <div className="game-header sport4">
                        <span className="game-header-name">
                            International Twenty20 Matches &gt; New Zealand v South Africa
                        </span>
                        <div>
                            <span>24/03/2026 23:15:00</span>
                        </div>
                    </div>

                    <div className="market-container">
                        {/* MATCH_ODDS */}
                        <MarketTable
                            title="MATCH_ODDS"
                            id="market0"
                            showUserBook={true}
                            marketClass="market-4"
                            columnHeader_1={{ type: "back", title: "Back" }}
                            columnHeader_2={{ type: "lay", title: "Lay" }}
                        >
                            <MarketRow
                                name="New Zealand"
                                back={[{ level: 2, odds: 1.81, size: "148.03" }, { level: 1, odds: 1.82, size: "117.46" }, { odds: 1.83, size: "6.88" }]}
                                lay={[{ odds: 1.86, size: "6.44" }, { level: 1, odds: 1.87, size: "9.32" }, { level: 2, odds: 1.89, size: "33.3" }]}
                            />
                            <MarketRow
                                name="South Africa"
                                back={[{ level: 2, odds: 2.12, size: "29.69" }, { level: 1, odds: 2.14, size: "8.14" }, { odds: 2.16, size: "5.55" }]}
                                lay={[{ odds: 2.2, size: "5.73" }, { level: 1, odds: 2.22, size: "101.27" }, { level: 2, odds: 2.24, size: "119.71" }]}
                            />
                        </MarketTable>

                        {/* Bookmaker */}
                        <MarketTable
                            title="Bookmaker"
                            id="market1"
                            showUserBook={true}
                            min="100"
                            max="50K"
                            remark='"The King of All MATKA Market Open And Close Every Hour! LIVE RESULTS,100% TRUSTED.”'
                            marketClass="market-4"
                            columnHeader_1={{ type: "back", title: "Back" }}
                            columnHeader_2={{ type: "lay", title: "Lay" }}
                        >
                            <MarketRow
                                name="New Zealand"
                                back={[{ noVal: true }, { noVal: true }, { odds: 82, size: "50K" }]}
                                lay={[{ odds: 86, size: "50K" }, { noVal: true }, { noVal: true }]}
                            />
                            <MarketRow
                                name="South Africa"
                                back={[{ noVal: true }, { noVal: true }, { odds: 116, size: "10K" }]}
                                lay={[{ odds: 121, size: "10K" }, { noVal: true }, { noVal: true }]}
                            />
                        </MarketTable>

                        {/* fancy1 */}
                        <MarketTable
                            title="fancy1"
                            id="market2"
                            showBetLock={true}
                            columnHeader_1={{ type: "back", title: "Back" }}
                            columnHeader_2={{ type: "lay", title: "Lay" }}
                        >
                            <FancyMarketRow
                                name="NZ Will Win the Toss(NZ vs SA)adv"
                                boxes={[{ type: "back", odds: 1.98, size: "5L" }, { type: "lay", noVal: true }]}
                                min="100" max="2L"
                            />
                            <FancyMarketRow
                                name="SA Will Win the Toss(NZ vs SA)adv"
                                boxes={[{ type: "back", odds: 1.98, size: "5L" }, { type: "lay", noVal: true }]}
                                min="100" max="2L"
                            />
                        </MarketTable>

                        {/* oddeven */}
                        <MarketTable
                            title="oddeven"
                            id="market3"
                            columnHeader_1={{ type: "back", title: "Odd" }}
                            columnHeader_2={{ type: "back", title: "Even" }}
                        >
                            {["1st inn 1 over run odd even(NZ vs SA)adv", "1st inn 2 over run odd even(NZ vs SA)adv", "2nd inn 9 over run odd even(NZ vs SA)adv", "2nd inn 10 over run odd even(NZ vs SA)adv"].map((name, idx) => (
                                <FancyMarketRow
                                    key={idx}
                                    name={name}
                                    boxes={[{ type: "back", odds: 1.98, size: "5L" }, { type: "back", odds: 1.98, size: "5L" }]}
                                    min="10" max="1L"
                                />
                            ))}
                        </MarketTable>

                        {/* khado */}
                        <MarketTable
                            title="khado"
                            id="market4"
                            columnHeader_1={{ type: "back", title: "Back" }}
                            marketClass="market-10"
                        >
                            {["6 over Khado run NZ adv - 0", "6 over Khado run SA adv - 0", "20 over Khado run NZ adv - 0", "20 over Khado run SA adv - 0"].map((name, idx) => (
                                <FancyMarketRow
                                    key={idx}
                                    name={name}
                                    boxes={[{ type: "back", noVal: true, suspended: true }]}
                                    min="100" max="1L"
                                    type="khado"
                                />
                            ))}
                        </MarketTable>

                        {/* TIED_MATCH */}
                        <MarketTable
                            title="TIED_MATCH"
                            id="market5"
                            showUserBook={true}
                            marketClass="market-4"
                            columnHeader_1={{ type: "back", title: "Back" }}
                            columnHeader_2={{ type: "lay", title: "Lay" }}
                        >
                            <MarketRow
                                name="Yes"
                                back={[{ level: 2, odds: 26, size: 167.9 }, { level: 1, odds: 34, size: 513.17 }, { odds: 50, size: 49.2 }]}
                                lay={[{ odds: 60, size: 34 }, { level: 1, odds: 65, size: 111 }, { level: 2, odds: 110, size: 91.32 }]}
                            />
                            <MarketRow
                                name="No"
                                back={[{ noVal: true }, { noVal: true }, { odds: 1.01, size: "19.11K" }]}
                                lay={[{ odds: 1.02, size: "2.41K" }, { level: 1, odds: 1.03, size: "16.94K" }, { level: 2, odds: 1.04, size: "4.2K" }]}
                            />
                        </MarketTable>
                    </div>
                </div>

                <MyBetsSidebar />
            </div>
        </div>
    );
};

export default EventPage;
