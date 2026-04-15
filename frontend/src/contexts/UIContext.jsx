import { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import PromptModal from "../components/PromptModal";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState({ isOpen: false });
  const [promptState, setPromptState] = useState({ isOpen: false });

  // ===== TOAST =====
  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => showToast(msg, "success"),
    error: (msg) => showToast(msg, "error"),
    info: (msg) => showToast(msg, "info"),
  };

  // ===== CONFIRM =====
  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        ...options,
        onConfirm: () => {
          setConfirmState({ isOpen: false });
          resolve(true);
        },
        onCancel: () => {
          setConfirmState({ isOpen: false });
          resolve(false);
        },
      });
    });
  }, []);

  // ===== PROMPT =====
  const prompt = useCallback((options) => {
    return new Promise((resolve) => {
      setPromptState({
        isOpen: true,
        ...options,
        onConfirm: (value) => {
          setPromptState({ isOpen: false });
          resolve(value);
        },
        onCancel: () => {
          setPromptState({ isOpen: false });
          resolve(null);
        },
      });
    });
  }, []);

  return (
    <UIContext.Provider value={{ toast, confirm, prompt }}>
      {children}

      {/* Container dos toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>

      <ConfirmModal {...confirmState} />
      <PromptModal {...promptState} />
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI deve ser usado dentro de UIProvider");
  return ctx;
}
