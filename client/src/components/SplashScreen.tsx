import { useEffect, useState } from "react";

const MAX_SPLASH_MS = 6000;

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);

  function finish() {
    if (fading) return;
    setFading(true);
    setTimeout(onDone, 300);
  }

  useEffect(() => {
    const timeout = setTimeout(finish, MAX_SPLASH_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-300 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      onClick={finish}
    >
      <video
        className="h-full w-full object-contain"
        src="/splash.mp4"
        autoPlay
        muted
        playsInline
        onEnded={finish}
        onError={finish}
      />
    </div>
  );
}
