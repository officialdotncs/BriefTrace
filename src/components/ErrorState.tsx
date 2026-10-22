interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="max-w-xl mx-auto px-6 py-16 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber/10 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-amber"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m0 3.75h.007M5.27 19.5h13.46c1.524 0 2.504-1.687 1.715-3.014l-6.73-11.486c-.762-1.301-2.668-1.301-3.43 0L3.555 16.486C2.766 17.813 3.746 19.5 5.27 19.5z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-navy mb-2">
        We couldn't analyze this brief
      </h2>
      <p className="text-sm text-neutral-dark mb-6 leading-relaxed">{message}</p>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-navy text-cream rounded-md text-sm font-medium hover:bg-navy-light transition-colors duration-200"
      >
        Try again
      </button>
    </div>
  );
}
