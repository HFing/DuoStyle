export default function Editorial({ onExploreClick }) {
  return (
    <section className="py-section-gap px-margin-desktop max-w-container-max mx-auto overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-16">
        <div className="md:col-span-7 relative">
          <div className="aspect-[16/9] overflow-hidden border border-outline-variant/20 shadow-lg">
            <img 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1600&q=90" 
              alt="Minimalist high-fashion editorial architecture"
            />
          </div>
        </div>
        <div className="md:col-span-5 md:pl-12">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-6">Our Philosophy</p>
          <h2 className="font-headline-md text-headline-md text-primary mb-8 leading-tight">
            Crafting spaces between the material and the soul.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 leading-relaxed">
            DuoStyle was founded on the principle of reductive luxury. We believe that true elegance is found not in excess, but in the precision of form, the quality of fiber, and the resonance of silence. Each piece is a testament to the artisan's hand and the visionary's eye.
          </p>
          <a className="font-label-caps text-label-caps uppercase tracking-widest border-b border-primary text-primary pb-2 hover:pb-3 transition-all" href="#">
            Read the Story
          </a>
        </div>
      </div>
    </section>
  );
}
