import React, { useState, useEffect, useRef } from 'react';
import { fetchCasinoList } from '../../api/API_games';
import { Link } from 'react-router-dom';
import { format_casino_list, gameCodeMap } from '../../utilies/helpers';
import { setAllCasinoGames } from '../../store/slices/casinoSlice';
import { useDispatch } from 'react-redux';
import CasinoHorizontalSlider from '../../components/CasinoHorizontalSlider';
import PageNamePath from '../../components/PageNamePath';

const CasinoList = () => {
  const dispatch = useDispatch();
  const [casinoData, setCasinoData] = useState({});
  const [casinoAllGames, setCasinoAllGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Casino');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetchCasinoList();
        if (response.status === 'ok') {
          setCasinoData(response.data);
          setCasinoAllGames(response.all_data);
          setCategories(['All Casino', ...Object.keys(response.data)]);
        }
      } catch (error) {
        console.error('Failed to fetch casino list:', error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

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

    if (selectedCategory === "Others") {
      const list = casinoData[selectedCategory];
      const filteredList = [...list.slice(0, 3), list[4], list[5], list[3], ...list.slice(6)];
      return filteredList;
    } else if (selectedCategory === "Worli") {
      const list = casinoData[selectedCategory];
      const filteredList = [list[2], list[0], list[1]];
      return filteredList;
    } else {
      return casinoData[selectedCategory] || [];
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div data-v-5a10e370="">
      <div data-v-5a10e370="">
        <PageNamePath
          pageName="Our Casino"
          pathArr={[
            { path: "/admin/home", name: "Home" },
            { path: "", name: "Our Casino" }
          ]}
        />
        <div className="card">
          <CasinoHorizontalSlider categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

          <div className="casino-banners">
            {getFilteredGames().filter(val => val.game_code !== "teen20v1").map((game, index) => (
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
