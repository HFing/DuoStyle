import { InfoModalTab } from './InfoModal';

interface FooterProps {
  onNavigate?: (page: string) => void;
  onOpenInfoModal?: (tab: InfoModalTab) => void;
}

export default function Footer({ onOpenInfoModal }: FooterProps) {
  return (
    <footer className="bg-surface-container-low dark:bg-surface-container-highest border-t border-outline-variant">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-desktop py-section-gap max-w-container-max mx-auto">
        <div className="flex flex-col gap-6">
          <span className="font-headline-sm text-headline-sm text-primary uppercase tracking-tighter">DuoStyle</span>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Defining the architecture of contemporary wardrobe through intentional minimalism and quiet luxury.
          </p>
        </div>
        <div>
          <h5 className="font-label-caps text-label-caps uppercase tracking-widest text-primary mb-6">Support</h5>
          <ul className="flex flex-col gap-4">
            <li>
              <button 
                type="button" 
                onClick={() => onOpenInfoModal?.('help')}
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100 cursor-pointer text-left"
              >
                Help
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => onOpenInfoModal?.('shipping')}
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100 cursor-pointer text-left"
              >
                Shipping
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => onOpenInfoModal?.('returns')}
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100 cursor-pointer text-left"
              >
                Returns
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="font-label-caps text-label-caps uppercase tracking-widest text-primary mb-6">Company</h5>
          <ul className="flex flex-col gap-4">
            <li>
              <button 
                type="button" 
                onClick={() => onOpenInfoModal?.('newsletter')}
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100 cursor-pointer text-left"
              >
                Newsletter
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => onOpenInfoModal?.('terms')}
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100 cursor-pointer text-left"
              >
                Terms
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => onOpenInfoModal?.('privacy')}
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100 cursor-pointer text-left"
              >
                Privacy
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="font-label-caps text-label-caps uppercase tracking-widest text-primary mb-6">Social</h5>
          <ul className="flex flex-col gap-4">
            <li><a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
            <li><a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="https://pinterest.com" target="_blank" rel="noreferrer">Pinterest</a></li>
            <li><a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-container-max mx-auto px-margin-desktop py-8 border-t border-outline-variant/30 flex justify-between items-center">
        <span className="font-body-md text-body-md text-on-surface-variant opacity-60">© 2026 DuoStyle. All rights reserved.</span>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-on-surface-variant">payments</span>
          <span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
        </div>
      </div>
    </footer>
  );
}
