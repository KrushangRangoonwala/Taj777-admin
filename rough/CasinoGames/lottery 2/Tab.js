import React from "react";

function Tab({ activeTab, title, min, max, tab, setActiveTab }) {
    const handleTabClick = (tab, e) => {
        e.preventDefault();
        setActiveTab(tab);
    };
    return (
        <li className="nav-item">
            <a
                href={`#${tab}`}
                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                onClick={(e) => handleTabClick(tab, e)}
            >
                {title}
                <div className="casino-min-max w-100">
                    R:<span>{min}</span>-<span>{max}</span>
                </div>
            </a>
        </li>
    );
}

export default Tab;
