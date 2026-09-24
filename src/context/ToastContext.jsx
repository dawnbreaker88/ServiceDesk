import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, confirmText, cancelText, isDestructive, onConfirm, onCancel }
  const [promptModal, setPromptModal] = useState(null); // { title, message, placeholder, defaultValue, confirmText, onSubmit, onCancel }
  const [promptValue, setPromptValue] = useState('');

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast('success', msg),
    error: (msg) => addToast('error', msg),
    warning: (msg) => addToast('warning', msg),
    info: (msg) => addToast('info', msg),
  };

  const confirm = ({
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
  }) => {
    return new Promise((resolve) => {
      setConfirmModal({
        title,
        message,
        confirmText,
        cancelText,
        isDestructive,
        onConfirm: () => {
          setConfirmModal(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmModal(null);
          resolve(false);
        },
      });
    });
  };

  const prompt = ({
    title = 'Input Required',
    message = 'Please provide details below:',
    placeholder = 'Type here...',
    defaultValue = '',
    confirmText = 'Submit',
    cancelText = 'Cancel',
  }) => {
    setPromptValue(defaultValue);
    return new Promise((resolve) => {
      setPromptModal({
        title,
        message,
        placeholder,
        confirmText,
        cancelText,
        onSubmit: (val) => {
          setPromptModal(null);
          resolve(val);
        },
        onCancel: () => {
          setPromptModal(null);
          resolve(null);
        },
      });
    });
  };

  return (
    <ToastContext.Provider value={{ toast, confirm, prompt }}>
      {children}

      {/* ─── Toast Container ───────────────────────────────────────── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-[12px] border shadow-xl flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-2 ${
                isSuccess
                  ? 'bg-white border-emerald-200 text-[#0a0a0a]'
                  : isError
                  ? 'bg-white border-red-200 text-[#0a0a0a]'
                  : isWarning
                  ? 'bg-white border-amber-200 text-[#0a0a0a]'
                  : 'bg-white border-[#e5e5e5] text-[#0a0a0a]'
              }`}
            >
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
              {isError && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#2563eb] flex-shrink-0 mt-0.5" />}

              <div className="flex-1 text-[13px] leading-relaxed">
                {t.message}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-[#737373] hover:text-[#0a0a0a] p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ─── UI Confirmation Modal ─────────────────────────────────── */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white border border-[#e5e5e5] rounded-[18px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  confirmModal.isDestructive
                    ? 'bg-red-50 text-red-600'
                    : 'bg-blue-50 text-[#2563eb]'
                }`}
              >
                {confirmModal.isDestructive ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-display font-semibold text-base text-[#0a0a0a]">
                  {confirmModal.title}
                </h3>
                <p className="text-[13px] text-[#737373] mt-0.5">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#f5f5f5]">
              <button
                type="button"
                onClick={confirmModal.onCancel}
                className="px-4 py-2 text-[13px] font-medium border border-[#e5e5e5] rounded-[8px] text-[#525252] hover:bg-[#fafafa]"
              >
                {confirmModal.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-5 py-2 text-[13px] font-medium rounded-[8px] text-white transition-all ${
                  confirmModal.isDestructive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#0a0a0a] hover:bg-[#262626]'
                }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── UI Prompt Modal ────────────────────────────────────────── */}
      {promptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white border border-[#e5e5e5] rounded-[18px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#f5f5f5] pb-3">
              <h3 className="font-display font-semibold text-base text-[#0a0a0a]">
                {promptModal.title}
              </h3>
              <button onClick={promptModal.onCancel} className="text-[#737373] hover:text-[#0a0a0a]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[13px] text-[#737373]">{promptModal.message}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                promptModal.onSubmit(promptValue);
              }}
              className="space-y-4"
            >
              <input
                type="text"
                autoFocus
                required
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                placeholder={promptModal.placeholder}
                className="w-full px-3.5 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-[#f5f5f5]">
                <button
                  type="button"
                  onClick={promptModal.onCancel}
                  className="px-4 py-2 text-[13px] font-medium border border-[#e5e5e5] rounded-[8px] text-[#525252] hover:bg-[#fafafa]"
                >
                  {promptModal.cancelText}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-[13px] font-medium rounded-[8px] bg-[#0a0a0a] hover:bg-[#262626] text-white transition-all"
                >
                  {promptModal.confirmText}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
