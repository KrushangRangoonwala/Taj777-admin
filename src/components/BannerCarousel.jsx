import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-bootstrap';
import { getBannerImages } from '../api/API';

const BannerCarousel = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const imgArr = await getBannerImages();
                setImages(imgArr);
            } catch (error) {
                console.error("Error in BannerCarousel fetch:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, []);

    if (loading) return <div className="carousel-loading">Loading banners...</div>;
    if (images.length === 0) return null;

    return (
        <div className="banner-carousel-container mb-3">
            <Carousel id="bannerCarousel" indicators={true} controls={true} interval={5000}>
                {images.map((img, index) => (
                    <Carousel.Item key={index}>
                        <div 
                            className="carousel-img-wrapper"
                            style={{ 
                                backgroundImage: `url(${img})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                height: '300px',
                                borderRadius: '8px'
                            }}
                        />
                    </Carousel.Item>
                ))}
            </Carousel>
        </div>
    );
};

export default BannerCarousel;
