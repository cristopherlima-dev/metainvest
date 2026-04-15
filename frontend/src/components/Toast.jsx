import { useEffect } from "react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const cores = {
    success: "bg-emerald-600 border-emerald-500",
    error: "bg-red-600 border-red-500",
    info: "bg-slate-700 border-slate-600",
  };

  const icones = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <div
      className={`${cores[toast.type] || cores.info} border-l-4 text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 min-w-[280px] max-w-md animate-slide-in`}
    >
      <span className="text-xl font-bold">
        {icones[toast.type] || icones.info}
      </span>
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-white/80 hover:text-white text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
