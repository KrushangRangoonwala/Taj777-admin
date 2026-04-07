import React from 'react';
import dayjs from 'dayjs';

const UpcomingFixtures = () => {
    const fixtures = [
        { title: "Alexandra Park", date: "20/03/2026 00:04:00", icon: "icon-10" },
        { title: "New Zealand v South Africa", date: "19/03/2026 23:15:00", icon: "icon-4" },
        { title: "Mikolaj Szymanowski - Giovanni Toti", date: "20/03/2026 01:00:00", icon: "icon-22" },
        { title: "Western Sydney Wanderers v Adelaide United", date: "20/03/2026 01:35:00", icon: "icon-1" },
        { title: "Ushkyn-kokshetau-ll U21 - Zhajyk 2 U21", date: "20/03/2026 03:00:00", icon: "icon-18" },
        { title: "NRG Esports - B8 Esports", date: "20/03/2026 04:00:00", icon: "icon-11" },
        { title: "Jiangsu Dragons - Guangdong Southern Tigers", date: "20/03/2026 04:35:00", icon: "icon-15" }
    ];

    const formatDate = (dateStr) => {
        return dayjs(dateStr).format('DD MMM, HH:mm A');
    };

    return (
        <div className="upcoming-fixtures-container card shadow-sm mb-3">
            <div className="card-header bg-primary text-white py-2">
                <h5 className="mb-0 fs-16"><i className="bx bx-calendar-event me-2"></i>Upcoming Fixtures</h5>
            </div>
            <div className="card-body p-0" style={{ maxHeight: '315px', overflowY: 'auto' }}>
                <ul className="list-group list-group-flush">
                    {fixtures.map((item, index) => (
                        <li key={index} className="list-group-item d-flex align-items-center py-2">
                            <div className="fixture-icon-wrapper me-3">
                                <i className={`bx bx-trophy text-warning fs-20 ${item.icon}`}></i>
                            </div>
                            <div className="flex-grow-1 overflow-hidden" title={item.title}>
                                <div className="fixture-title text-truncate fw-bold fs-14" style={{ whiteSpace: 'nowrap' }}>{item.title}</div>
                                <div className="fixture-date text-muted fs-12">{formatDate(item.date)}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default UpcomingFixtures;
