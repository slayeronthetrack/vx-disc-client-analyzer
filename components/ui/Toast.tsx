/**
 * Toast Notification Component
 * Reusable toast for success, error, info, and warning messages
 */

'use client';

import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const TOAST_STYLES = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-500',
    icon: CheckCircle2,
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-500',
    icon: AlertCircle,
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-500',
    icon: Info,
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-500',
    icon: AlertTriangle,
  },
};

export function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
  const style = TOAST_STYLES[type];
  const Icon = style.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 ${style.bg} border ${style.border} rounded-lg p-4 shadow-lg z-50 animate-slide-in max-w-md`}
    >
      <div className="flex items-start gap-3">
        <Icon className={style.text} size={20} />
        <p className={`${style.text} flex-1`}>{message}</p>
        <button
          onClick={onClose}
          className={`${style.text} hover:opacity-70 transition-opacity`}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

/**
 * Toast Manager Hook
 * Manages multiple toast notifications
 */
export function useToast() {
  const showToast = (type: ToastType, message: string, duration = 5000) => {
    const id = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.id = id;
    document.body.appendChild(toast);

    const style = TOAST_STYLES[type];
    const Icon = style.icon;

    toast.className = `fixed top-4 right-4 ${style.bg} border ${style.border} rounded-lg p-4 shadow-lg z-50 animate-slide-in max-w-md`;
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <svg class="${style.text}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' : ''}
          ${type === 'error' ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' : ''}
          ${type === 'info' ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>' : ''}
          ${type === 'warning' ? '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>' : ''}
        </svg>
        <p class="${style.text} flex-1">${message}</p>
        <button class="${style.text} hover:opacity-70 transition-opacity" onclick="document.getElementById('${id}').remove()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    if (duration > 0) {
      setTimeout(() => {
        toast.remove();
      }, duration);
    }
  };

  return {
    success: (message: string, duration?: number) => showToast('success', message, duration),
    error: (message: string, duration?: number) => showToast('error', message, duration),
    info: (message: string, duration?: number) => showToast('info', message, duration),
    warning: (message: string, duration?: number) => showToast('warning', message, duration),
  };
}
