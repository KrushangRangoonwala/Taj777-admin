import React, { useState } from 'react'
import PageNamePath from '../../components/PageNamePath'
import CasinoHorizontalSlider from '../../components/CasinoHorizontalSlider'
import { useSelector } from 'react-redux';
import { gameCodeMap } from '../../utilies/helpers';
import { Link } from 'react-router-dom';

const VipCasino = () => {
    const [selectedCategory, setSelectedCategory] = useState('All Casino');
    const casino_list = useSelector(store => store.casino.casino_list);
    const game = casino_list.teen20v1;

    return (
        <>
            <PageNamePath
                pageName="VIP Casino"
                pathArr={[
                    { path: "/admin/home", name: "Home" },
                    { path: "", name: "VIP Casino" }
                ]}
            />
            <div className="card">
                <CasinoHorizontalSlider categories={["All Casino", "Teennpatti"]} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

                <div className="casino-banners">
                    <div className="casino-banner-item">
                        <Link to={`/admin/casino/${gameCodeMap[game?.game_code] ?? game?.game_code}`} className="">
                            <img
                                className="img-fluid"
                                alt={game?.game_name}
                                src={game?.game_image}
                                loading="lazy"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default VipCasino