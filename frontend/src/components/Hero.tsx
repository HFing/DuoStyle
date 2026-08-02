import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    fetch('/api/v1/banners')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch banners');
      })
      .then((data: Banner[]) => {
        if (data && data.length > 0) {
          setBanners(data);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_BANNERS if API is unavailable or returning empty
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
      className="relative w-full h-[65vh] md:h-[85vh] lg:h-screen overflow-hidden group bg-black cursor-pointer"
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
            <div
              className={`w-full h-full bg-cover bg-center transition-transform duration-[4500ms] ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
              style={{ backgroundImage: `url('${banner.imageUrl}')` }}
            />
            {/* Gradient Overlay for Sleek Look */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          </div>
        );
      })}

      {/* Prev / Next Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 hover:scale-110 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 hover:scale-110 shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Bottom Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                idx === currentIndex
                  ? 'w-10 bg-white shadow-md'
                  : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
