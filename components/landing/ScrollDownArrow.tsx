'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function ScrollDownArrow() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const loginSection = document.getElementById('login-section');
    if (!loginSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Hide arrow when login section is no longer in view
          setVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(loginSection);

    return () => {
      observer.disconnect();
    };
  }, []);

  function handleClick() {
    const landingSection = document.getElementById('landing');
    if (landingSection) {
      landingSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (!visible) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes bb-bounce-arrow {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(8px); }
            }
          `,
        }}
      />
      <button
        type="button"
        onClick={handleClick}
        className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-1 border-none bg-transparent transition-opacity duration-300 hover:opacity-100"
        style={{
          color: 'var(--bb-ink-40)',
          opacity: 0.6,
          cursor: 'pointer',
        }}
        aria-label="Rolar para baixo"
      >
        <span
          style={{
            animation: 'bb-bounce-arrow 2s ease-in-out infinite',
            display: 'flex',
          }}
        >
          <ChevronDown size={28} strokeWidth={2} />
        </span>
        <span className="text-xs" style={{ opacity: 0.6 }}>
          Descubra mais
        </span>
      </button>
    </>
  );
}
