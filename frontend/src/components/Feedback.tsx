export function Loading({ label = 'لحظة…' }: { label?: string }) {
  return (
    <div className="center-col" style={{ gap: 14, padding: '48px 0' }}>
      <span className="spinner" aria-hidden />
      <span className="sub">{label}</span>
    </div>
  );
}

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-banner" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginInlineStart: 12,
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            textDecoration: 'underline',
            fontWeight: 700,
          }}
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
