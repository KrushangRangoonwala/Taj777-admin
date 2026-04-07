import React from 'react';
import { getImage } from '../../../../utilies/helpers';

const Result_Image = ({ name, folder, size = 35, className = "", col = 12, offset = 0, align = "center" }) => {
    if (!name) return null;
    
    // Support for multiple images if name is comma separated
    const imageNames = typeof name === 'string' ? name.split(',').filter(n => n.trim() !== '') : [name];

    return (
        <div className={`col-12 col-lg-${col} ${offset ? `offset-lg-${offset}` : ''} text-${align} my-2 ${className}`}>
             <div className="casino-result-cards">
                {imageNames.map((imgName, index) => (
                    <div key={index} className="casino-result-cards-item">
                        <img 
                            src={getImage(imgName, folder)} 
                            style={{ width: `${size}px` }} 
                            alt={imgName}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Result_Image;
