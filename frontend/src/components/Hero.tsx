import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

interface Banner {
  id: number;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder?: number;
  active?: boolean;
}

const DEFAULT_BANNERS: Banner[] = [
  {
    id: 1,
    imageUrl: 'https://n7media.coolmate.me/uploads/2026/04/03/CM1561_2_1.jpg',
    linkUrl: '#products'
  },
  {
    id: 2,
    imageUrl: 'https://n7media.coolmate.me/uploads/2026/04/03/CM1946_2_1.jpg',
    linkUrl: '#products'
  },
  {
    id: 3,
    imageUrl: 'https://n7media.coolmate.me/uploads/2026/06/24/DSC_5699.jpg',
    linkUrl: '#products'
  },
  {
    id: 4,
    imageUrl: 'https://n7media.coolmate.me/uploads/2026/01/08/ao-thun-chay-bo-airflow-gradient-286-cam.jpg',
    linkUrl: '#products'
  }
];

export default function Hero({ onShopNow }: { onShopNow?: () => void }) {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    api
      .get('/banners')
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) {
          setBanners(data);
        }
      })
      .catch((err) => {
        console.error('Error fetching home banners:', err);
      });
  }, []);

  useEffect(() => {
    if (isHovered || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isHovered, banners.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const currentBanner = banners[currentIndex] || DEFAULT_BANNERS[0];

  const handleBannerClick = () => {
    if (currentBanner.linkUrl && currentBanner.linkUrl.startsWith('#')) {
      const element = document.querySelector(currentBanner.linkUrl);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    if (onShopNow) {
      onShopNow();
    }
  };

  return (
    <section 
      className="relative w-full h-[52vh] sm:h-[68vh] md:h-[80vh] lg:h-[86vh] max-h-[820px] overflow-hidden group bg-neutral-950 cursor-pointer select-none border-b border-outline-variant/30 shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleBannerClick}
    >
      {/* Banner Slides */}
      {banners.map((banner, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={banner.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={banner.imageUrl}
              alt={banner.title || 'DuoStyle Hero Banner'}
              className={`w-full h-full object-cover object-top transition-transform duration-[5000ms] ${
                isActive ? 'scale-[1.03]' : 'scale-100'
              }`}
            />
            {/* Elegant Double Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
          </div>
        );
      })}

      {/* Prev / Next Glassmorphism Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        </>
      )}

      {/* Glassmorphism Bottom Progress & Counter Bar */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center gap-4 shadow-2xl">
          <span className="text-[11px] font-mono font-bold text-white/90 tracking-widest select-none">
            {String(currentIndex + 1).padStart(2, '0')} / {String(banners.length).padStart(2, '0')}
          </span>
          <div className="w-[1px] h-3 bg-white/30" />
          <div className="flex items-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === currentIndex
                    ? 'w-8 bg-white shadow-sm'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
