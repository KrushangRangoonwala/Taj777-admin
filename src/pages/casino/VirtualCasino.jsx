import React from 'react'
import PageNamePath from '../../components/PageNamePath'
import CasinoHorizontalSlider from '../../components/CasinoHorizontalSlider'

const VirtualCasino = () => {
    return (
        <>
            <PageNamePath
                pageName="Virtual Casino"
                pathArr={[
                    { path: "/admin/home", name: "Home" },
                    { path: "", name: "Virtual Casino" }
                ]}
            />
            <div className="card">
                <CasinoHorizontalSlider categories={[]} selectedCategory={null} setSelectedCategory={() => { }} />
            </div>
        </>
    )
}

export default VirtualCasino