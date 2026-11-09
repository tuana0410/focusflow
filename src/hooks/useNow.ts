import { useEffect, useState } from "react";

/**
 * Returns the current time and updates it a few times per second while `running` is true.
 * The timer is based on real timestamps, so it stays correct even if the browser
 * slows down the interval when the tab is in the background.
 */
export function useNow(running: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [running]);

  return now;
}
