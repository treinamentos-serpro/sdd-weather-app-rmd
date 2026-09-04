interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  return (
    <div
      aria-live="polite"
      className="flex min-h-40 items-center justify-center rounded-xl border border-white/10 bg-white/5 p-6 text-white shadow-glass backdrop-blur-md"
      role="status"
    >
      <span className="flex items-center gap-3 text-white/80">
        <span
          aria-hidden="true"
          className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-accent-400"
        />
        {message}
      </span>
    </div>
  );
}