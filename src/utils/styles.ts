export const inputClass =
  "block w-full px-3 py-2 bg-transparent border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500";

export type Message = {
  severity: "error" | "warning" | "info";
  text: string;
};

export const messageStyles = {
  error: {
    label: "Error",
    boxClass: "",
  },
  warning: {
    label: "Warning",
    boxClass: "",
  },
  info: {
    label: "Info",
    boxClass: "bg-sky-300 text-sky-800 border-sky-700",
  },
} satisfies Record<Message["severity"], { boxClass: string; label: string }>;
