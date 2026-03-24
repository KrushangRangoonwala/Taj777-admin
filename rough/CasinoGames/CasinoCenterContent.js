import React, { lazy, Suspense, useEffect, useState } from "react";
import Modal from "react-modal";
import Footer from "../CenterContainer/Footer";
import SwitchTheme from "../CenterContainer/Mobile/SwitchTheme";
import PointMenu from "../CenterContainer/Mobile/PointMenu";
import useIsMobile from "../../hooks/useIsMobile";

// import PlaceBet from "./PlaceBet";
// import Placebetcard32 from "./Placebetcard32";
// import Placebetcard32b from "./Placebetcard32b";
// import PlacebetAAA from "./PlacebetAAA";
// import PlacebetAAA2 from "./PlacebetAAA2";
// import PlacebetAndarBahar1 from "./PlacebetAndarBahar1";
// import PlacebetAndarBahar3 from "./PlacebetAndarBahar3";
// import PlacebetTeen20 from "./PlacebetTeen20";
import PlacebetBeachRoulette from "./PlacebetBeachRoulette";
import PlacebetGoldenRoulette from "./PlacebetGoldenRoulette";
import PlacebetRoulette13 from "./PlacebetRoulette13";
import PlacebetUniqueRoulette from "./PlacebetUniqueRoulette";
// import PlacebetTeen20c from "./PlacebetTeen20c";
// import PlacebetTeen20b from "./PlacebetTeen20b";
import PlacebetTeen62 from "./PlacebetTeen62";
// import PlacebetInstantTeenPatti from "./PlacebetInstantTeenPatti";
// import PlacebetInstantTeenPatti3 from "./PlacebetInstantTeenPatti3";
// import PlacebetInstantTeenPatti2 from "./PlacebetInstantTeenPatti2";
// import PlacebetCasinoWar from "./PlacebetCasinoWar";
// import PlacebetTeenpattiTest from "./PlacebetTeenpattiTest";
// import PlacebetTeenPattiOpen from "./PlacebetTeenPattiOpen";
// import PlaceBet_DragonTiger from "./PlaceBet_DragonTiger";
// import PlacebetMuflisTeenPatti from "./PlacebetMuflisTeenPatti";
// import PlacebetTeenPatti2Cards from "./PlacebetTeenPatti2Cards";
// // import PlacebetAndarBahar4 from "./PlacebetAndarBahar4";
import PlacebetAndarBahar2 from "./PlacebetAndarBahar2";
// import PlacebetTwentyNineCardBaccarat from "./PlacebetTwentyNineCardBaccarat";
// import PlacebetQueen from "./PlacebetQueen";
// import PlacebetRace2 from "./PlacebetRace2";
// import PlacebetRaceTo17 from "./PlacebetRaceTo17";
// import PlacebetRace20 from "./PlacebetRace20";
import Cricket2020 from "./Cricket2020";
import Placebet_Common from "./Placebet_Common";
import Goal from "./Goal";
// import PlacebetTeenPatti41 from "./PlacebetTeenPatti41";
// import PlacebetTeenPatti42 from "./PlacebetTeenPatti42";
// import PlacebetTeenPattiJoker20 from "./PlacebetTeenPattiJoker20";
import Unlimited_Joker_2020 from "./Unlimited_Joker_2020";
import JokerTeenPatti1 from "./JokerTeenPatti1";
import PlacebetJokerTeenPattiOneDay from "./PlacebetJokerTeenPattiOneDay";
import PlacebetJokerTeenPatti1 from "./PlacebetJokerTeenPatti1";
import PlacebetTeenPattiPoison from "./PlacebetTeenPattiPoison";
import PlacebetTeenPattiPoison20 from "./PlacebetTeenPattiPoison20";
import Cmeter from "./Cmeter";
import Cmeter_1card from "./Cmeter_1card";
import PlacebetTeenUnique from "./PlacebetTeenUnique";
// import PlacebetBollywoodCasino2 from "./PlacebetBollywoodCasino2";
// import PlacebetOdiTeenPatti from "./PlacebetOdiTeenPatti";
import PlaceBet_Lottery from "./components/PlaceBet_Lottery";
import DoliDana from "./DoliDana";

// import Dum10 from "./Dum10";
// import KBC from "./KBC";
// import BallByBall from "./BallByBall";
// import NoteNum from "./NoteNum";
// import Trap from "./Trap";
// import Lottery from "./Lottery";

const TeenPatti = lazy(() => import("./TeenPatti"));
const BollywoodCasino2 = lazy(() => import("./BollywoodCasino2"));

// ... existing code ...


// ... (rest of lazy imports)
const Lucky7eu2 = lazy(() => import("./Lucky7eu2"));
const Lucky7 = lazy(() => import("./Lucky7"));
const Lucky7eu = lazy(() => import("./Lucky7eu"));
const DragonTiger = lazy(() => import("./DragonTiger"));
const DragonTigerDayOne = lazy(() => import("./DragonTigerDayOne"));
const DragonTigerLionT20 = lazy(() => import("./DragonTigerLionT20"));
const InstantTeenPatti2 = lazy(() => import("./InstantTeenPatti2"));
const TeenPatti20b = lazy(() => import("./TeenPatti20b"));
const TeenPatti2Cards = lazy(() => import("./TeenPatti2Cards"));
const TeenPattiOneDay = lazy(() => import("./TeenPattiOneDay"));
const TeenPattiTest = lazy(() => import("./TeenPattiTest"));
const TeenPattiOpen = lazy(() => import("./TeenPattiOpen"));
const TeenPatti2 = lazy(() => import("./TeenPatti2"));
const Queen = lazy(() => import("./Queen"));
const Race2 = lazy(() => import("./Race2"));
const RaceTo17 = lazy(() => import("./RaceTo17"));
const Race20 = lazy(() => import("./Race20"));
const Worli = lazy(() => import("./Worli"));
const InstantWorli = lazy(() => import("./InstantWorli"));
const WorliMatka = lazy(() => import("./WorliMatka"));
const MatkaMarket = lazy(() => import("./MatkaMarket"));
const PokerOneDay = lazy(() => import("./PokerOneDay"));
const PokerT20 = lazy(() => import("./PokerT20"));
const Poker6Player = lazy(() => import("./Poker6Player"));
const Baccarat = lazy(() => import("./Baccarat"));
const Baccarat2 = lazy(() => import("./Baccarat2"));
const Cards32A = lazy(() => import("./Cards32A"));
const Cards32B = lazy(() => import("./Cards32B"));
const AndarBahar1 = lazy(() => import("./AndarBahar1"));
const AndarBahar3 = lazy(() => import("./AndarBahar3"));
const AndarBahar2 = lazy(() => import("./AndarBahar2"));
const AAA = lazy(() => import("./AAA"));
const AAA2 = lazy(() => import("./AAA2"));
const CasinoWar = lazy(() => import("./CasinoWar"));
const BollyWoodTable = lazy(() => import("./BollyWoodTable"));
const Superover = lazy(() => import("./Superover"));
const OdiTeenPatti = lazy(() => import("./odi_teenpatti"));
const BeachRoulette = lazy(() => import("./BeachRoulette"));
const GoldenRoulette = lazy(() => import("./GoldenRoulette"));
const Roulette13 = lazy(() => import("./Roulette13"));
const UniqueRoulette = lazy(() => import("./UniqueRoulette"));
const TeenPatti20 = lazy(() => import("./TeenPatti20"));
const TeenPatti20c = lazy(() => import("./TeenPatti20c"));


const TeenPatti62 = lazy(() => import("./TeenPatti62"));
const InstantTeenPatti = lazy(() => import("./InstantTeenPatti"));
const InstantTeenPatti3 = lazy(() => import("./InstantTeenPatti3"));
const MuflisTeenPatti = lazy(() => import("./MuflisTeenPatti"));
const AndarBahar4 = lazy(() => import("./AndarBahar4"));
const TwentyNineCardBaccarat = lazy(() => import("./TwentyNineCardBaccarat"));


const TeenPatti41 = lazy(() => import("./TeenPatti41"));
const TeenPatti42 = lazy(() => import("./TeenPatti42"));
const TeenPattiJoker20 = lazy(() => import("./TeenPattiJoker20"));
const TeenPattiPoison = lazy(() => import("./TeenPattiPoison"));
const TeenPattiPoison20 = lazy(() => import("./TeenPattiPoison20"));
const Mogambo = lazy(() => import("./Mogambo"));
const TeenUnique = lazy(() => import("./TeenUnique"));
const Sicbo = lazy(() => import("./Sicbo"));
const OneCardOneDay = lazy(() => import("./OneCardOneDay"));
const OneCard2020 = lazy(() => import("./OneCard2020"));
const Trio = lazy(() => import("./Trio"));
const Lucky5 = lazy(() => import("./Lucky5"));

const Dum10 = lazy(() => import("./Dum10"));
const KBC = lazy(() => import("./KBC"));
const BallByBall = lazy(() => import("./BallByBall"));
const NoteNum = lazy(() => import("./NoteNum"));
const Trap = lazy(() => import("./Trap"));
const Lottery = lazy(() => import("./Lottery"));
const ThreeCardJ = lazy(() => import("./ThreeCardJ"));

const componentMap = {
    teenpatti: TeenPatti,

    lucky7: Lucky7,
    lucky7eu: Lucky7eu,
    lucky7eu2: Lucky7eu,

    dragontigert20: DragonTiger,
    dragontigeroneday: DragonTigerDayOne,
    dragontigerliont20: DragonTigerLionT20,
    dragontigert202: DragonTiger,

    instantteenpatti2: InstantTeenPatti2,

    // teenpatti20b: TeenPatti20b,
    // teen20c: TeenPatti20c,
    // teenpatti20c: TeenPatti20c,
    teenpattit20: TeenPatti20,
    teenpattit20b: TeenPatti20b,
    teenpattit20c: TeenPatti20c,

    teenpatti2cards: TeenPatti2Cards,
    teenpattioneday: TeenPattiOneDay,
    teenpattitest: TeenPattiTest,
    teenpattiopen: TeenPattiOpen,
    teenpatti2: TeenPatti2,
    queen: Queen,

    race2: Race2,
    race20: Race20,
    raceto17: RaceTo17,

    matka_market: MatkaMarket,
    worli_matka: WorliMatka,
    instant_worli: InstantWorli,

    pokeroneday: PokerOneDay,
    pokert20: PokerT20,
    poker6player: Poker6Player,

    baccarat: Baccarat,
    baccarat2: Baccarat2,
    'card32-A': Cards32A,
    'card32-B': Cards32B,

    andarbahar: AndarBahar1,
    andarbahar2: AndarBahar2,
    ab3: AndarBahar3,
    ab4: AndarBahar4,

    aaa: AAA2, // AAA
    aaa2: AAA2,
    bollywoodtable: BollyWoodTable,
    bollywoodtable2: BollywoodCasino2,

    war: CasinoWar,

    superover3: Superover,
    superover2: Superover,
    superover: Superover,
    '5fivecricket': Superover,

    odi_teenpatti: OdiTeenPatti,
    roulette12: BeachRoulette,
    roulette11: GoldenRoulette,
    roulette13: Roulette13,
    "our-roulette": UniqueRoulette,


    teenpattioneday62: TeenPatti62,
    teen6: TeenPatti2,
    instantteenpatti: InstantTeenPatti,
    instantteenpatti3: InstantTeenPatti3,
    muflisteenpatti: MuflisTeenPatti,
    teenmuf: MuflisTeenPatti,
    '29cardbaccarat': TwentyNineCardBaccarat,
    'cricket-match-2020': Cricket2020,

    goal: Goal,
    cmeter: Cmeter,
    '1cardmeter': Cmeter_1card,

    teenpatti41: TeenPatti41,
    teenpatti42: TeenPatti42,
    jokerteenpatti20: TeenPattiPoison20,
    poison: TeenPattiPoison20,
    poisonteenpatti20: TeenPattiPoison20,
    mogambo: Mogambo,

    jokerteenpatti120: Unlimited_Joker_2020,
    jokerteenpatti1: JokerTeenPatti1,
    unique_teenpatti: TeenUnique,

    sicbo: Sicbo,
    sicbo2: Sicbo,
    "1card1day": OneCardOneDay,
    "1card2020": OneCard2020,

    "dum10": Dum10,
    "kbc": KBC,
    ball_by_ball: BallByBall,
    lucky15: BallByBall,
    notenum: NoteNum,
    trap: Trap,
    trio: Trio,
    lucky5: Lucky5,
    lottery: Lottery,
    "3cardsjudgement": ThreeCardJ,
    dolidana: DoliDana,

    // IF U CHANGE GAME_PATH, ALSO CHANGE IT IN CasinoCenterContent.JS , gamePath_MapTo_gametype IN casinoDeatils_byType.js , Casinomap.js
};


const PLACE_BET_COMPONENT_MAP = {
    // cards32a: Placebetcard32,
    // cards32b: Placebetcard32b,
    // aaa: PlacebetAAA,
    // aaa2: PlacebetAAA2,
    teenpattioneday62: PlacebetTeen62,
    // teen62: PlacebetTeen62,
    // instantteenpatti: PlacebetInstantTeenPatti,
    // instantteenpatti2: PlacebetInstantTeenPatti2,
    // instantteenpatti3: PlacebetInstantTeenPatti3,

    roulette12: PlacebetBeachRoulette,
    roulette11: PlacebetGoldenRoulette,
    roulette13: PlacebetRoulette13,
    "our-roulette": PlacebetUniqueRoulette,
    // roulette12: Placebet_Common,

    // teenpattit20: PlacebetTeen20,
    // teenpattit20b: PlacebetTeen20b,

    // teenpatti20c: PlacebetTeen20c,
    // teenpatti20b: PlacebetTeen20b,
    // teenpatti20c: Placebet_Common,
    // teenpatti20b: Placebet_Common,

    // teen20c: PlacebetTeen20c,
    // teen20b: PlacebetTeen20b,
    // teen20c: Placebet_Common,
    // teen20b: Placebet_Common,

    // '29cardbaccarat': PlacebetTwentyNineCardBaccarat,

    // teenpattitest: PlacebetTeenpattiTest,
    // teenpattiopen: PlacebetTeenPattiOpen,
    // muflisteenpatti: PlacebetMuflisTeenPatti,
    // teenmuf: PlacebetMuflisTeenPatti,
    // teenpatti2cards: PlacebetTeenPatti2Cards,

    // odi_teenpatti: PlacebetOdiTeenPatti,
    // teenpatti41: PlacebetTeenPatti41,
    // teenpatti42: PlacebetTeenPatti42,
    // jokerteenpatti20: PlacebetTeenPattiJoker20,

    poison: PlacebetTeenPattiPoison,
    poisonteenpatti20: PlacebetTeenPattiPoison20,

    jokerteenpatti120: PlacebetJokerTeenPattiOneDay,
    jokerteenpatti1: PlacebetJokerTeenPatti1,

    unique_teenpatti: PlacebetTeenUnique,
    // andarbahar2: PlacebetAndarBahar2,
    // bollywoodtable2: PlacebetBollywoodCasino2,

    lottery: PlaceBet_Lottery,
};


Modal.setAppElement("#root");

const CasinoCenterContent = ({ isVisible, pageName }) => {
    const isMobile = useIsMobile();
    const [selectedBet, setSelectedBet] = useState(null);
    const [lastBetTime, setLastBetTime] = useState(0);
    const [exposureTrigger, setExposureTrigger] = useState(0);

    const [placebet_msg, setPlacebet_msg] = useState(null);

    useEffect(() => {
        setPlacebet_msg(null);
    }, [pageName])

    console.log('Current pageName:', pageName);
    const SelectedComponent = componentMap[pageName] || (() => <p>No specific game selected.</p>);
    const PlaceBetComponent = PLACE_BET_COMPONENT_MAP[pageName] ?? Placebet_Common;

    // Handle bet selection from game components
    const handleBetSelection = (betData) => {
        setSelectedBet(betData);
    };

    // Handle bet submission
    const handleBetSubmit = () => {  // onSubmit()
        setSelectedBet(null); // Clear after submission
        setLastBetTime(Date.now());
    };

    // Handle open bet update to trigger exposure refresh
    const handleOpenBetUpdate = () => {
        setExposureTrigger(prev => prev + 1);
    };

    return (
        <>
            <SwitchTheme />
            <PointMenu isVisible={isVisible} />
            <div className="casino-center">
                <div id="element" className="casino-container">

                    <Suspense fallback={<div>Loading...</div>}>
                        <SelectedComponent
                            selectedBet={selectedBet}
                            onBetSelection={handleBetSelection}
                            lastBetTime={lastBetTime}
                            exposureTrigger={exposureTrigger}
                            placebet_msg={placebet_msg}
                        />
                    </Suspense>

                    {isMobile && (
                        <div className="mt-1 text-center">
                            <PlaceBetComponent
                                betData={selectedBet}
                                onSubmit={handleBetSubmit}
                                onClose={() => setSelectedBet(null)}
                                gameType={pageName}
                                onOpenBetUpdate={handleOpenBetUpdate}
                                setPlacebet_msg={setPlacebet_msg}
                            />
                        </div>
                    )}
                </div>
                <Footer />
            </div>

            {!isMobile && (
                <div id="right-sidebar-id" className="right-sidebar casino-right-sidebar teen2sidebar">
                    <span></span>
                    <PlaceBetComponent
                        betData={selectedBet}
                        onSubmit={handleBetSubmit}
                        gameType={pageName}
                        onOpenBetUpdate={handleOpenBetUpdate}
                        setPlacebet_msg={setPlacebet_msg}
                    />
                    <span></span>
                </div>
            )}
        </>

    );
};

export default CasinoCenterContent;
