import React from 'react'

const RemarkMarquee = ({ remark }) => {
    return (
        <div className='casino-remark'>
            <div className='remark-icon'>
                <img
                    src="/assets/images/remark.png"
                    alt="Remark"
                />
            </div>

            <marquee>{remark}</marquee>
        </div>
    )
}

export default RemarkMarquee