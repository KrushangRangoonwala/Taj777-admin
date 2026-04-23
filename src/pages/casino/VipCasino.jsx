import React from 'react'
import PageNamePath from '../../components/PageNamePath'
import CasinoHorizontalSlider from '../../components/CasinoHorizontalSlider'

const VipCasino = () => {
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
                <CasinoHorizontalSlider categories={[]} selectedCategory={null} setSelectedCategory={() => { }} />
            </div>
        </>
    )
}

export default VipCasino