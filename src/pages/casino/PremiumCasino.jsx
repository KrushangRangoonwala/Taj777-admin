import React from 'react'
import PageNamePath from '../../components/PageNamePath'
import CasinoHorizontalSlider from '../../components/CasinoHorizontalSlider'

const PremiumCasino = () => {
    return (
        <>
            <PageNamePath
                pageName="Premium Casino"
                pathArr={[
                    { path: "/admin/home", name: "Home" },
                    { path: "", name: "Premium Casino" }
                ]}
            />
            <div className="card">
                <CasinoHorizontalSlider categories={[]} selectedCategory={null} setSelectedCategory={() => { }} />
            </div>
        </>
    )
}

export default PremiumCasino