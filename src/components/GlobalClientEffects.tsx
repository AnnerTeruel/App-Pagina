
"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useZoerIframe } from "@/hooks/useZoerlframe";
import { useInitializeData } from "@/hooks/useInitializeData";
import { Theme } from "@zoerai/zoer-copilot";

function GlobalClientEffectsContent() {
  const { theme } = useTheme();

  useZoerIframe();
  useInitializeData();

  const ZoerCopilot = dynamic(
    async () => {
      const mod = await import("@zoerai/zoer-copilot");
      return mod.ZoerCopilot;
    },
    { ssr: false }
  );

  return <ZoerCopilot theme={theme as Theme} postgrestApiKey={''} />;
}

export default function GlobalClientEffects() {
  return (
    <Suspense fallback={null}>
      <GlobalClientEffectsContent />
    </Suspense>
  );
}
