import React, { useRef } from 'react'
import { Link } from 'react-router-dom';

const CasinoHorizontalSlider = ({ categories, selectedCategory, setSelectedCategory }) => {
    const tabListRef = useRef(null);

    const handleScroll = (direction) => {
        if (tabListRef.current) {
            const scrollAmount = 200;
            tabListRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="casino-tabs-admin p-2">
            <div className="casino-tabs-menu w-100">
                <Link to="#" className="arrow-tabs arrow-left" onClick={() => handleScroll('left')}>
                    <i className="mdi mdi-chevron-left"></i>
                </Link>
                <ul className="nav nav-tabs nav-tabs-custom" ref={tabListRef} style={{ overflowX: 'hidden', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
                    {categories?.map((category) => (
                        <li className="nav-item" key={category} style={{ flex: '0 0 auto' }}>
                            <Link
                                to="#"
                                className={`nav-link ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </Link>
                        </li>
                    ))}
                </ul>
                <Link to="#" className="arrow-tabs arrow-right" onClick={() => handleScroll('right')}>
                    <i className="mdi mdi-chevron-right"></i>
                </Link>
            </div>
        </div>
    )
}

export default CasinoHorizontalSlider