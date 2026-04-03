export default function Loading() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes bb-fade-in-scale {
              0% {
                opacity: 0;
                transform: scale(0.95);
              }
              100% {
                opacity: 1;
                transform: scale(1);
              }
            }
            @keyframes bb-progress {
              0% {
                width: 0%;
              }
              100% {
                width: 100%;
              }
            }
            @keyframes bb-fade-in {
              0% {
                opacity: 0;
              }
              100% {
                opacity: 1;
              }
            }
          `,
        }}
      />
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bb-depth-1)]"
      >
        {/* Logo */}
        <h1
          className="text-4xl font-bold tracking-tight text-[var(--bb-ink-100)]"
          style={{
            animation: 'bb-fade-in-scale 0.8s ease-out forwards',
            opacity: 0,
          }}
        >
          Black
          <span className="text-[#DC2626]">Belt</span>
        </h1>

        {/* Subtle loading indicator — no text */}
        <div
          className="mt-6 h-1 w-16 overflow-hidden rounded-full bg-[var(--bb-depth-3)]"
          style={{
            animation: 'bb-fade-in 0.6s ease-out 0.4s forwards',
            opacity: 0,
          }}
        >
          <div
            className="h-full rounded-full bg-[#DC2626]"
            style={{
              animation: 'bb-progress 1.2s ease-in-out infinite',
              width: '40%',
            }}
          />
        </div>

        {/* Progress bar at bottom */}
        <div className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden bg-[var(--bb-depth-3)]">
          <div
            className="h-full bg-[#DC2626]"
            style={{
              animation: 'bb-progress 1.5s ease-in-out forwards',
              width: '0%',
            }}
          />
        </div>
      </div>
    </>
  );
}
