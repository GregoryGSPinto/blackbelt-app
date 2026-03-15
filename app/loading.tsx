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
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)' }}
      >
        {/* Logo */}
        <h1
          className="text-4xl font-bold tracking-tight text-white"
          style={{
            animation: 'bb-fade-in-scale 0.8s ease-out forwards',
            opacity: 0,
          }}
        >
          Black
          <span className="text-[#DC2626]">Belt</span>
        </h1>

        {/* Message */}
        <p
          className="mt-4 text-sm text-neutral-500"
          style={{
            animation: 'bb-fade-in 0.6s ease-out 0.4s forwards',
            opacity: 0,
          }}
        >
          Preparando seu tatame...
        </p>

        {/* Progress bar at bottom */}
        <div className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden bg-neutral-900">
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
