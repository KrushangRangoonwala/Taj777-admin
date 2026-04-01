import React from 'react'

const RemarkMarquee = ({ remark }) => {
    return (
        <div className="casino-remark mt-3">
            <div className="remark-icon">
                <img alt="remark" src="/admin/assets/images/remark.png" />
            </div>
            <marquee>{remark}</marquee>
        </div>
    )
}

export default RemarkMarquee