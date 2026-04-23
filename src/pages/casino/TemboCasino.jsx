import React from 'react'
import PageNamePath from '../../components/PageNamePath'
import CasinoHorizontalSlider from '../../components/CasinoHorizontalSlider'

const TemboCasino = () => {
    return (
        <>
            <PageNamePath
                pageName="Tembo Casino"
                pathArr={[
                    { path: "/admin/home", name: "Home" },
                    { path: "", name: "Tembo Casino" }
                ]}
            />
            <div className="card">
                <CasinoHorizontalSlider categories={[]} selectedCategory={null} setSelectedCategory={() => { }} />
            </div>
        </>
    )
}

export default TemboCasino