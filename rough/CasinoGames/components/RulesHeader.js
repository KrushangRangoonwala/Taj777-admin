import React from 'react'
import useIsMobile from '../../../hooks/useIsMobile';

const RulesHeader = () => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <div
                style={{
                    padding: "8px 8px",
                    background: "var(--bg-table-header-new)",
                    marginBottom: "10px",
                    fontWeight: "bold",
                    color: "var(--text-fancy)",
                    fontSize: "14px",
                    textAlign: "left",
                }}
            >
                RULES
            </div>
        )
    }
    return (
        <div
            style={{
                maxWidth: "375px",
                margin: "16px auto 6px",
                fontWeight: "750",
                color: "#aaafb5",
                fontSize: "14px",
            }}
        >
            RULES
        </div>
    )
}

export default RulesHeader