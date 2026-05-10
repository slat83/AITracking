"use client";

import { useEffect } from "react";

const SESSION_STORAGE_KEY = "ai-visibility-session-id";

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSessionId() {
  const existingId = window.sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (existingId) {
    return existingId;
  }

  const nextId = createSessionId();
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, nextId);
  return nextId;
}

function sendEvent(payload: Record<string, string>) {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/visibility", blob);
    return;
  }

  void fetch("/api/analytics/visibility", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body,
    keepalive: true,
  });
}

type VisibilityTrackerProps = {
  pathname: string;
  pageTitle: string;
};

export function VisibilityTracker({ pathname, pageTitle }: VisibilityTrackerProps) {
  useEffect(() => {
    const sessionId = getSessionId();

    sendEvent({
      pathname,
      pageTitle,
      sessionId,
      eventType: "PAGE_VIEW",
      referrer: document.referrer,
    });

    const handleClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest<HTMLAnchorElement>("a[data-visibility-cta]");

      if (!anchor) {
        return;
      }

      sendEvent({
        pathname,
        pageTitle,
        sessionId,
        eventType: "CTA_CLICK",
        ctaLabel: anchor.dataset.visibilityCta ?? "unknown",
        ctaHref: anchor.href,
        referrer: document.referrer,
      });
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [pathname, pageTitle]);

  return null;
}
