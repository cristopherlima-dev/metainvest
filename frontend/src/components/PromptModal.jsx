import { useEffect, useState } from "react";

export default function PromptModal({
  isOpen,
  title,
  message,
  defaultValue = "",
  inputType = "text",
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) setValue(defaultValue);
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm(value);
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        {message && <p className="text-slate-300 mb-4">{message}</p>}
        <input
          type={inputType}
          step={inputType === "number" ? "0.01" : undefined}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white mb-6"
        />
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
          >
            {confirmText}
          </button>
        </div>
      </form>
    </div>
  );
}
