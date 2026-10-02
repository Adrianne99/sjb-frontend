// Which landing-page section is on screen right now (for highlighting the menu).
//
//   const active = useActiveSection(["home", "about", "contact"], isLandingPage);
//
// A section counts as "active" once its top passes 40% down the screen.
// Returns null when `enabled` is false (e.g. on other pages).
import { useEffect, useState } from "react";

export function useActiveSection(sectionIds: string[], enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  const idsKey = sectionIds.join(",");

  useEffect(() => {
    if (!enabled) return;
    const ids = idsKey.split(",");
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current = ids[0];
      for (const id of ids) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [idsKey, enabled]);

  return enabled ? active : null;
}
