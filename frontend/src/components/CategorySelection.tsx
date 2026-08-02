export default function CategorySelection({ onSelectCategory }) {
  return (
    <section className="py-section-gap px-margin-desktop max-w-container-max mx-auto" id="collections">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {/* Men's Card */}
        <div 
          onClick={() => onSelectCategory && onSelectCategory('MEN')}
          className="group relative overflow-hidden aspect-[4/5] cursor-pointer border border-outline-variant/20 shadow-md"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
            style={{ backgroundImage: `url('https://res.cloudinary.com/hfing/image/upload/v1785604872/duostyle_products/coolmate_seed/ao-thun-nam-pickleball-dink-shot-1.jpg')` }}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
          <div className="absolute bottom-12 left-12">
            <h3 className="font-headline-md text-headline-md text-white mb-4 uppercase drop-shadow-md">Men's Collection</h3>
            <span className="font-label-caps text-label-caps text-white uppercase tracking-widest border-b border-white pb-1 group-hover:pr-4 transition-all inline-block">Explore</span>
          </div>
        </div>
        {/* Women's Card */}
        <div 
          onClick={() => onSelectCategory && onSelectCategory('WOMEN')}
          className="group relative overflow-hidden aspect-[4/5] cursor-pointer border border-outline-variant/20 shadow-md"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
            style={{ backgroundImage: `url('https://res.cloudinary.com/hfing/image/upload/v1785604881/duostyle_products/coolmate_seed/tanktop-pickle-ball-nu-flexracer-back-1.jpg')` }}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
          <div className="absolute bottom-12 left-12">
            <h3 className="font-headline-md text-headline-md text-white mb-4 uppercase drop-shadow-md">Women's Collection</h3>
            <span className="font-label-caps text-label-caps text-white uppercase tracking-widest border-b border-white pb-1 group-hover:pr-4 transition-all inline-block">Explore</span>
          </div>
        </div>
      </div>
    </section>
  );
}
