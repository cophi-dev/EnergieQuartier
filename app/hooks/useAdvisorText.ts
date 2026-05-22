"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAdvisorFallbackText } from "@/app/lib/llm/fallbacks";
import {
  clearAdvisorCache,
  getAdvisorCache,
  setAdvisorCache,
} from "@/app/lib/advisor-cache";
import type {
  AdvisorContext,
  AdvisorTextResponse,
  AdvisorTextSlot,
} from "@/app/types/advisor-text";

export type AdvisorTextStatus = "idle" | "loading" | "ready" | "fallback";

interface UseAdvisorTextOptions {
  slot: AdvisorTextSlot;
  cacheKey: string;
  context: AdvisorContext;
  enabled?: boolean;
}

interface UseAdvisorTextResult {
  text: string;
  status: AdvisorTextStatus;
  source: "llm" | "fallback" | "cache" | null;
  regenerate: () => void;
}

export function useAdvisorText({
  slot,
  cacheKey,
  context,
  enabled = true,
}: UseAdvisorTextOptions): UseAdvisorTextResult {
  const fallback = useMemo(
    () => getAdvisorFallbackText(slot, context),
    [slot, cacheKey, context],
  );
  const contextRef = useRef(context);
  contextRef.current = context;
  const [text, setText] = useState(fallback);
  const [status, setStatus] = useState<AdvisorTextStatus>("idle");
  const [source, setSource] = useState<"llm" | "fallback" | "cache" | null>(
    null,
  );
  const abortRef = useRef<AbortController | null>(null);

  const fetchText = useCallback(
    async (forceRefresh: boolean) => {
      if (!enabled) return;

      if (!forceRefresh) {
        const cached = getAdvisorCache(slot, cacheKey);
        if (cached) {
          setText(cached.text);
          setSource("cache");
          setStatus("ready");
          return;
        }
      } else {
        clearAdvisorCache(slot, cacheKey);
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("loading");

      try {
        const response = await fetch("/api/grok", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slot,
            cacheKey,
            context: contextRef.current,
            forceRefresh,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("API error");
        }

        const data = (await response.json()) as AdvisorTextResponse;
        setText(data.text);
        setSource(data.source);
        setStatus(data.source === "fallback" ? "fallback" : "ready");

        setAdvisorCache({
          slot,
          cacheKey,
          text: data.text,
          source: data.source === "llm" ? "llm" : "fallback",
          createdAt: data.generatedAt,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const fb = getAdvisorFallbackText(slot, contextRef.current);
        setText(fb);
        setSource("fallback");
        setStatus("fallback");
        setAdvisorCache({
          slot,
          cacheKey,
          text: fb,
          source: "fallback",
          createdAt: new Date().toISOString(),
        });
      }
    },
    [slot, cacheKey, enabled, fallback],
  );

  useEffect(() => {
    void fetchText(false);
    return () => abortRef.current?.abort();
  }, [fetchText]);

  const regenerate = useCallback(() => {
    void fetchText(true);
  }, [fetchText]);

  return { text, status, source, regenerate };
}
