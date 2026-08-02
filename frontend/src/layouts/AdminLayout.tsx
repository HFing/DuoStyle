import React from 'react';
import ToastNotification from '../components/ToastNotification';
import InfoModal, { InfoModalTab } from '../components/InfoModal';

interface AdminLayoutProps {
  children?: React.ReactNode;
  user?: any;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  toast?: { show?: boolean; message: string; type: 'success' | 'error' } | null;
  onCloseToast?: () => void;
  infoModalTab?: InfoModalTab | null;
  onCloseInfoModal?: () => void;
  showToast?: (msg: string, type?: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  toast,
  onCloseToast,
  infoModalTab = null,
  onCloseInfoModal,
  showToast,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased flex flex-col">
      <main className="flex-grow">{children}</main>
      {toast?.show && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={onCloseToast || (() => {})}
        />
      )}
      <InfoModal
        isOpen={Boolean(infoModalTab)}
        activeTab={infoModalTab}
        onClose={onCloseInfoModal || (() => {})}
        showToast={showToast}
      />
    </div>
  );
};

export default AdminLayout;
