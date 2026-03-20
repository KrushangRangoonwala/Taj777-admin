import React from 'react';

const StatCard = ({ title, value, valueClass }) => {
    return (
        <div className="col-6 col-md-3">
            <div className="card mini-stats-wid">
                <div className="card-body">
                    <p className="text-muted fw-medium">{title}</p>
                    <h4 className={valueClass || ''}>{value}</h4>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
