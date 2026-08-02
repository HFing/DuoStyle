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
          <p className="font-label-caps text-label-caps text-secondary font-bold uppercase tracking-widest mb-4">Triết Lý Của Chúng Tôi</p>
          <h2 className="font-headline-md text-headline-md text-primary mb-6 leading-tight">
            Khai mở không gian giao thoa giữa chất liệu và tâm hồn.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed">
            DuoStyle được sáng lập dựa trên triết lý <span className="font-semibold text-primary">"sang trọng tinh giản" (reductive luxury)</span>. Chúng tôi tin rằng sự thanh lịch đích thực không nằm ở sự phô trương hay dư thừa, mà hiện hữu trong sự tỉ mỉ của phom dáng, chất lượng hảo hạng của từng sợi vải và sự đồng điệu đầy tĩnh lặng. Mỗi thiết kế là một minh chứng cho bàn tay tài hoa của người thợ thủ công và góc nhìn tầm vóc của nhà thiết kế.
          </p>
          <button 
            type="button"
            onClick={onExploreClick}
            className="font-label-caps text-label-caps uppercase tracking-widest border-b border-primary text-primary pb-2 hover:pb-3 transition-all cursor-pointer font-bold inline-flex items-center gap-2"
          >
            Khám Phá Câu Chuyện →
          </button>
        </div>
      </div>
    </section>
  );
}
