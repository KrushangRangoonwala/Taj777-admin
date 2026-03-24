import React, { useState, useEffect, useRef } from 'react';
import { fetchCasinoList } from '../../api/API';
import { Link } from 'react-router-dom';
import { format_casino_list } from '../../utilies/helpers';
import { setAllCasinoGames } from '../../store/slices/casinoSlice';
import { useDispatch } from 'react-redux';

const gameCodeMap = {
  // IF U CHANGE GAME_PATH, ALSO CHANGE IT IN CasinoCenterContent.JS , gamePath_MapTo_gametype IN casinoDeatils_byType.js , Casinomap.js

  "casino_war": "war",
  '32_cards-a': 'card32-A',
  '32_cards-b': 'card32-B',
  'ab204': 'ab4',
  'ab202': 'andarbahar2',
  'ab20': 'andarbahar',
  'baccarat': 'baccarat',
  'baccarat2': 'baccarat2',
  'teensin': '29cardbaccarat',
  'aaa': 'aaa',
  'aaa2': 'aaa2',
  '20_teenpatti': 'teenpattit20',
  'teen20c': 'teenpatti20c',
  'teen20b': 'teenpatti20b',
  'teen33': 'instantteenpatti3',
  'teen32': 'instantteenpatti2',
  'test_teenpatti': 'teenpattitest',
  'open_teenpatti': 'teenpattiopen',
  'teenmuf': 'teenmuf',
  'patti2': 'teenpatti2cards',
  'race17': 'raceto17',

  '1day_poker': 'pokeroneday',
  '6player_poker': 'poker6player',
  '20poker': 'pokert20',
  'teen3': 'instantteenpatti',
  'teen62': 'teenpattioneday62',

  'cmeter1': '1cardmeter',
  'teen1': '1card1day',
  'teen120': '1card2020',

  '20_dragon_tiger': 'dragontigert20',
  'odi_dragon_tiger': 'dragontigeroneday',
  'dtl20': 'dragontigerliont20',
  'dt202': 'dragontigert202',

  '5_cricket': '5fivecricket',
  'cc20': 'cricket-match-2020',
  'teen41': 'teenpatti41',
  'teen42': 'teenpatti42',
  'joker20': 'jokerteenpatti20',
  'joker1': 'jokerteenpatti1',
  'joker120': 'jokerteenpatti120',
  'teenunique': 'unique_teenpatti',
  'btable2': 'bollywoodtable2',
  'poison20': 'poisonteenpatti20',
  'ddb': 'bollywoodtable',

  "teen20": "teenpattit20",
  "teen20b": "teenpattit20b",
  "teen20c": "teenpattit20c",

  "ballbyball": "ball_by_ball",
  "thetrap": "trap",

  "lottcard": "lottery",
  "3cardj": "3cardsjudgement",

  "worli3": "matka_market",

  // IF U CHANGE GAME_PATH, ALSO CHANGE IT IN CasinoCenterContent.JS , gamePath_MapTo_gametype IN casinoDeatils_byType.js , Casinomap.js
};

const CasinoList = () => {
  const dispatch = useDispatch();
  const [casinoData, setCasinoData] = useState({});
  const [casinoAllGames, setCasinoAllGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Casino');
  const [loading, setLoading] = useState(true);
  const tabListRef = useRef(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetchCasinoList();
        if (response.status === 'ok') {
          setCasinoData(response.data);
          setCasinoAllGames(response.all_data);
          setCategories(['All Casino', ...Object.keys(response.data)]);

          const formated_casino_list = format_casino_list(response.all_data || []);
          dispatch(setAllCasinoGames(formated_casino_list));
        }
      } catch (error) {
        console.error('Failed to fetch casino list:', error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const handleScroll = (direction) => {
    if (tabListRef.current) {
      const scrollAmount = 200;
      tabListRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const sortGames = (games) => {
    if (!Array.isArray(games)) return [];
    return games.sort((a, b) => {
      const pA = parseInt(a.priority);
      const pB = parseInt(b.priority);
      const valA = isNaN(pA) ? 9999 : pA;
      const valB = isNaN(pB) ? 9999 : pB;
      return valA - valB;
    });
  };

  const getFilteredGames = () => {
    if (selectedCategory === 'All Casino') {
      return sortGames(casinoAllGames) || [];
    }
    return casinoData[selectedCategory] || [];
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div data-v-5a10e370="">
      <div data-v-5a10e370="">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Our Casino</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <a href="/admin/home" className="" target="_self">Home</a>
                  </li>
                  <li className="breadcrumb-item active">
                    <span aria-current="location">Our Casino</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="casino-tabs-admin p-2">
            <div className="casino-tabs-menu w-100">
              <a href="javascript:void(0)" className="arrow-tabs arrow-left" onClick={() => handleScroll('left')}>
                <i className="mdi mdi-chevron-left"></i>
              </a>
              <ul className="nav nav-tabs nav-tabs-custom" ref={tabListRef} style={{ overflowX: 'hidden', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
                {categories.map((category) => (
                  <li className="nav-item" key={category} style={{ flex: '0 0 auto' }}>
                    <a
                      href="javascript:void(0)"
                      className={`nav-link ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
              <a href="javascript:void(0)" className="arrow-tabs arrow-right" onClick={() => handleScroll('right')}>
                <i className="mdi mdi-chevron-right"></i>
              </a>
            </div>
          </div>

          <div className="casino-banners">
            {getFilteredGames().map((game, index) => (
              <div className="casino-banner-item" key={`${game.game_code}-${index}`}>
                <Link to={`/admin/casino/${gameCodeMap[game.game_code] ?? game.game_code}`} className="">
                  <img
                    className="img-fluid"
                    alt={game.game_name}
                    src={game.game_image}
                    loading="lazy"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasinoList;
