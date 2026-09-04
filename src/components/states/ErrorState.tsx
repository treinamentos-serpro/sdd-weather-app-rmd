interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      aria-live="assertive"
      className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-red-300/20 bg-red-950/20 p-6 text-center text-white shadow-glass backdrop-blur-md"
      role="alert"
    >
      <p className="text-base text-white/90">{message}</p>
      <button
        className="mt-5 min-h-11 rounded-lg bg-accent-500 px-5 py-3 font-medium text-white transition hover:bg-accent-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:bg-accent-600 disabled:opacity-60"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </div>
  );
}