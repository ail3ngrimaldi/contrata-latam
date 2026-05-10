import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

export function PrivyLoadingBar() {
  const { ready } = usePrivy();
  const [visible, setVisible] = useState(true);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Animate to 80% quickly, then wait for Privy
    const t1 = setTimeout(() => setWidth(80), 50);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (ready) {
      setWidth(100);
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [ready]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-laser transition-all ease-out"
        style={{
          width: `${width}%`,
          transitionDuration: width === 80 ? "1500ms" : "300ms",
          opacity: width === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
