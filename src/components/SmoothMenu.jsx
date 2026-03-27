import React from "react";

const SmoothMenu = ({ isOpen, className, children, isEvent }) => {
    if (isEvent) {
        return (
            <ul
                aria-expanded={isOpen ? "true" : "false"}
                className={`${className || ""} sub-menu mm-collapse ${isOpen ? "mm-show" : ""}`.trim()}
            >
                {children}
            </ul>
        )
    }
    return (
        <div className={`custom-dropdown-container ${isOpen ? 'is-open' : ''}`}>
            <div className="custom-dropdown-inner">
                <ul
                    aria-expanded={isOpen ? "true" : "false"}
                    className={`${className || ""} sub-menu`.trim()}
                >
                    {children}
                </ul>
            </div>
        </div>
    );
};

export default SmoothMenu;
