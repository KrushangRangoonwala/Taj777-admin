import React, { useRef } from 'react'

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
                <a href="javascript:void(0)" className="arrow-tabs arrow-left" onClick={() => handleScroll('left')}>
                    <i className="mdi mdi-chevron-left"></i>
                </a>
                <ul className="nav nav-tabs nav-tabs-custom" ref={tabListRef} style={{ overflowX: 'hidden', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
                    {categories?.map((category) => (
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
    )
}

export default CasinoHorizontalSlider