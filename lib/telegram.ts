declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending';

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    auth_date?: number;
    hash?: string;
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  openInvoice: (url: string, callback?: (status: InvoiceStatus) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  ready: () => void;
  expand: () => void;
  close: () => void;
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
}

export function getTelegramUser(): TelegramUser | null {
  const webApp = getTelegramWebApp();
  if (webApp?.initDataUnsafe?.user) {
    return webApp.initDataUnsafe.user;
  }
  return null;
}

export function initTelegramApp(): void {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.ready();
    webApp.expand();
  }
}

export function hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection'): void {
  const webApp = getTelegramWebApp();
  if (webApp?.HapticFeedback) {
    if (type === 'selection') {
      webApp.HapticFeedback.selectionChanged();
    } else if (['success', 'error', 'warning'].includes(type)) {
      webApp.HapticFeedback.notificationOccurred(type as 'success' | 'error' | 'warning');
    } else {
      webApp.HapticFeedback.impactOccurred(type as 'light' | 'medium' | 'heavy');
    }
  }
}

export function isTelegramWebApp(): boolean {
  return getTelegramWebApp() !== null;
}

export function openTelegramInvoice(
  invoiceUrl: string, 
  callback?: (status: InvoiceStatus) => void
): boolean {
  const webApp = getTelegramWebApp();
  if (webApp?.openInvoice) {
    webApp.openInvoice(invoiceUrl, callback);
    return true;
  }
  return false;
}

export function showTelegramAlert(message: string, callback?: () => void): boolean {
  const webApp = getTelegramWebApp();
  if (webApp?.showAlert) {
    webApp.showAlert(message, callback);
    return true;
  }
  return false;
}

export type { InvoiceStatus };

export function getStartParam(): string | null {
  // First try Telegram's native start_param (works for direct Mini App links)
  const webApp = getTelegramWebApp();
  if (webApp?.initDataUnsafe?.start_param) {
    return webApp.initDataUnsafe.start_param;
  }
  
  // Fallback: check URL hash for referral code (works for web_app button)
  // Format: #ref=REFERRAL_CODE
  if (typeof window !== 'undefined' && window.location.hash) {
    const hash = window.location.hash.substring(1); // Remove #
    const params = new URLSearchParams(hash);
    const refCode = params.get('ref');
    if (refCode) {
      return refCode;
    }
  }
  
  return null;
}
