import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AiChatBox from '../components/AiChatBox';
import ToastNotification from '../components/ToastNotification';
import InfoModal, { InfoModalTab } from '../components/InfoModal';

interface MainLayoutProps {
  children?: React.ReactNode;
  user?: any;
  cartCount?: number;
  currentPage?: string;
  activeCategoryFilter?: string;
  onNavigate?: (page: string, filter?: string, prodId?: any, extraMsg?: string, query?: string, subCatId?: any) => void;
  onOpenCart?: () => void;
  onOpenAuth?: () => void;
  onOpenInfoModal?: (tab: InfoModalTab) => void;
  toast?: { show?: boolean; message: string; type: 'success' | 'error' } | null;
  onCloseToast?: () => void;
  infoModalTab?: InfoModalTab | null;
  onCloseInfoModal?: () => void;
  showToast?: (msg: string, type?: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  cartCount = 0,
  currentPage = 'home',
  activeCategoryFilter = '',
  onNavigate,
  onOpenCart,
  onOpenAuth,
  onOpenInfoModal,
  toast,
  onCloseToast,
  infoModalTab = null,
  onCloseInfoModal,
  showToast,
}) => {
  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-secondary-container selection:text-on-secondary-container">
      {toast?.show && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={onCloseToast || (() => {})}
        />
      )}
      <Navbar
        currentPage={currentPage}
        activeCategoryFilter={activeCategoryFilter}
        onNavigate={onNavigate}
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        onOpenAuth={onOpenAuth}
      />
      <AiChatBox />
      <main className="flex-grow">{children}</main>
      <Footer onOpenInfoModal={onOpenInfoModal} />
      <InfoModal
        isOpen={Boolean(infoModalTab)}
        activeTab={infoModalTab}
        onClose={onCloseInfoModal || (() => {})}
        showToast={showToast}
      />
    </div>
  );
};

export default MainLayout;
