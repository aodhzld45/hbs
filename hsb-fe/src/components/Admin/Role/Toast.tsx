import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

interface ToastProps {
  state: ToastState;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ state, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!state.show) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [state.show, duration, onClose]);

  if (!state.show) return null;

  const bg =
    state.type === 'success'
      ? 'bg-green-600'
      : state.type === 'error'
        ? 'bg-red-600'
        : 'bg-gray-700';

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] ${bg} px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium`}
      role="alert"
    >
      {state.message}
    </div>
  );
};

export default Toast;
