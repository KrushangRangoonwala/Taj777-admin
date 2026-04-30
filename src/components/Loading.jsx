import React from 'react'

const Loading = () => {
    return (
        <>
            <style>{`
                .loader-overlay {
                    position: fixed;
                    z-index: 11111;
                    width: 100%;
                    height: 100vh;
                    background: rgba(255, 255, 255, 0.5);
                    top: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    left: 0;
                }
                .loader-overlay i{
                    font-size: 50px;
                }
            `}</style>

            <div data-v-5a10e370="" className="loader-overlay">
                <i className="fas fa-spinner fa-spin"></i>
            </div>
        </>
    )
}

export default Loading