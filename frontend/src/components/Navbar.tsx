import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Navbar({ currentPage = 'home', activeCategoryFilter = '', onNavigate, cartCount = 0, onOpenCart, onOpenAuth }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [activeHover, setActiveHover] = useState(null);
  const [categoryTree, setCategoryTree] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    api.get('/categories/tree')
      .then(res => {
        if (res.data?.data) {
          setCategoryTree(res.data.data);
        }
      })
      .catch(err => console.log("Using static category menu"));
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (onNavigate) {
        onNavigate('collections', '', null, '', searchInput);
      }
    }
  };

  const menCategory = categoryTree.find(c => c.name.toLowerCase().includes('nam') || c.genderTarget === 'MEN');
  const womenCategory = categoryTree.find(c => c.name.toLowerCase().includes('nữ') || c.genderTarget === 'WOMEN');

  return (
    <header className={`fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 transition-all duration-300 ease-in-out ${isScrolled ? 'h-16 shadow-sm' : 'h-20'}`}>
      <nav className="flex justify-between items-center h-full px-margin-desktop max-w-container-max mx-auto">
        <div className="flex items-center gap-10 h-full">
          <button 
            onClick={() => onNavigate && onNavigate('home')} 
            className="font-headline-md text-headline-md tracking-tighter text-primary cursor-pointer border-none bg-transparent hover:opacity-90 transition-opacity flex items-center h-full"
          >
            DuoStyle
          </button>

          <div className="hidden md:flex items-center gap-8 h-full">
            {/* MEN Link + Dropdown Menu */}
            <div 
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveHover('Men')}
              onMouseLeave={() => setActiveHover(null)}
            >
              <button 
                onClick={() => onNavigate && onNavigate('collections', 'Men')} 
                className={`font-label-caps text-label-caps uppercase tracking-widest transition-colors duration-300 cursor-pointer flex items-center gap-1 border-b-2 py-1 ${
                  currentPage === 'collections' && activeCategoryFilter === 'Men' 
                    ? 'text-secondary border-secondary font-bold' 
                    : 'text-on-surface-variant hover:text-secondary border-transparent'
                }`}
              >
                <span>MEN</span>
                <span className={`material-symbols-outlined text-xs transition-transform duration-200 ${activeHover === 'Men' ? 'rotate-180 text-secondary' : ''}`}>expand_more</span>
              </button>

              {/* Clean Classic Dropdown Menu */}
              {activeHover === 'Men' && (
                <div className="absolute top-full left-0 w-64 bg-surface-container-lowest border border-outline-variant shadow-xl p-3 flex flex-col gap-1 z-50 rounded-b-md">
                  <div className="font-label-caps text-[10px] text-secondary uppercase tracking-widest font-bold pb-2 mb-1 border-b border-outline-variant/60 flex items-center justify-between">
                    <span>THỜI TRANG NAM</span>
                  </div>
                  {menCategory?.subCategories && menCategory.subCategories.length > 0 ? (
                    menCategory.subCategories.map(sub => (
                      <button 
                        key={sub.id}
                        onClick={() => {
                          if (onNavigate) onNavigate('collections', 'Men', null, '', '', sub.id);
                          setActiveHover(null);
                        }}
                        className="w-full text-left font-body-md text-xs text-on-surface-variant hover:text-primary hover:font-bold py-2 px-3 hover:bg-surface-container transition-all cursor-pointer rounded flex items-center justify-between group"
                      >
                        <span>{sub.name}</span>
                        <span className="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                      </button>
                    ))
                  ) : (
                    <>
                      <button onClick={() => { onNavigate('collections', 'Men'); setActiveHover(null); }} className="w-full text-left font-body-md text-xs py-2 px-3 hover:bg-surface-container rounded">Bộ Suit & Vest Nam</button>
                      <button onClick={() => { onNavigate('collections', 'Men'); setActiveHover(null); }} className="w-full text-left font-body-md text-xs py-2 px-3 hover:bg-surface-container rounded">Áo Sơ Mi Nam</button>
                      <button onClick={() => { onNavigate('collections', 'Men'); setActiveHover(null); }} className="w-full text-left font-body-md text-xs py-2 px-3 hover:bg-surface-container rounded">Quần Tây Nam</button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* WOMEN Link + Dropdown Menu */}
            <div 
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveHover('Women')}
              onMouseLeave={() => setActiveHover(null)}
            >
              <button 
                onClick={() => onNavigate && onNavigate('collections', 'Women')} 
                className={`font-label-caps text-label-caps uppercase tracking-widest transition-colors duration-300 cursor-pointer flex items-center gap-1 border-b-2 py-1 ${
                  currentPage === 'collections' && activeCategoryFilter === 'Women' 
                    ? 'text-secondary border-secondary font-bold' 
                    : 'text-on-surface-variant hover:text-secondary border-transparent'
                }`}
              >
                <span>WOMEN</span>
                <span className={`material-symbols-outlined text-xs transition-transform duration-200 ${activeHover === 'Women' ? 'rotate-180 text-secondary' : ''}`}>expand_more</span>
              </button>

              {/* Clean Classic Dropdown Menu */}
              {activeHover === 'Women' && (
                <div className="absolute top-full left-0 w-64 bg-surface-container-lowest border border-outline-variant shadow-xl p-3 flex flex-col gap-1 z-50 rounded-b-md">
                  <div className="font-label-caps text-[10px] text-secondary uppercase tracking-widest font-bold pb-2 mb-1 border-b border-outline-variant/60 flex items-center justify-between">
                    <span>THỜI TRANG NỮ</span>
                  </div>
                  {womenCategory?.subCategories && womenCategory.subCategories.length > 0 ? (
                    womenCategory.subCategories.map(sub => (
                      <button 
                        key={sub.id}
                        onClick={() => {
                          if (onNavigate) onNavigate('collections', 'Women', null, '', '', sub.id);
                          setActiveHover(null);
                        }}
                        className="w-full text-left font-body-md text-xs text-on-surface-variant hover:text-primary hover:font-bold py-2 px-3 hover:bg-surface-container transition-all cursor-pointer rounded flex items-center justify-between group"
                      >
                        <span>{sub.name}</span>
                        <span className="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                      </button>
                    ))
                  ) : (
                    <>
                      <button onClick={() => { onNavigate('collections', 'Women'); setActiveHover(null); }} className="w-full text-left font-body-md text-xs py-2 px-3 hover:bg-surface-container rounded">Váy & Đầm Nữ</button>
                      <button onClick={() => { onNavigate('collections', 'Women'); setActiveHover(null); }} className="w-full text-left font-body-md text-xs py-2 px-3 hover:bg-surface-container rounded">Áo Kiểu & Sơ Mi Nữ</button>
                      <button onClick={() => { onNavigate('collections', 'Women'); setActiveHover(null); }} className="w-full text-left font-body-md text-xs py-2 px-3 hover:bg-surface-container rounded">Áo Măng Tô & Vest Nữ</button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* COLLECTIONS Link */}
            <div className="relative h-full flex items-center">
              <button 
                onClick={() => onNavigate && onNavigate('collections', '')} 
                className={`font-label-caps text-label-caps uppercase tracking-widest transition-colors duration-300 cursor-pointer flex items-center border-b-2 py-1 ${
                  currentPage === 'collections' && !activeCategoryFilter 
                    ? 'text-secondary border-secondary font-bold' 
                    : 'text-on-surface-variant hover:text-secondary border-transparent'
                }`}
              >
                <span>COLLECTIONS</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 h-full">
          <div className="hidden md:flex items-center border-b border-outline-variant/50 focus-within:border-secondary transition-all">
            <input 
              className="bg-transparent border-none focus:ring-0 font-label-caps text-label-caps uppercase tracking-widest w-36 focus:w-60 transition-all duration-500 pb-1 text-xs" 
              placeholder="TÌM SẢN PHẨM..." 
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchSubmit}
            />
            <button 
              onClick={handleSearchSubmit}
              className="text-on-surface-variant hover:text-primary pb-1 cursor-pointer border-none bg-transparent transition-colors"
            >
              <span className="material-symbols-outlined text-sm">search</span>
            </button>
          </div>
          <button 
            onClick={onOpenAuth} 
            className="text-primary hover:text-secondary transition-colors cursor-pointer flex items-center"
            title="Tài Khoản"
          >
            <span className="material-symbols-outlined hover:fill-1 text-xl">account_circle</span>
          </button>
          <button 
            onClick={onOpenCart} 
            className="text-primary hover:text-secondary transition-colors relative cursor-pointer flex items-center"
            title="Giỏ Hàng"
          >
            <span className="material-symbols-outlined hover:fill-1 text-xl">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-secondary text-on-secondary font-label-caps text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
