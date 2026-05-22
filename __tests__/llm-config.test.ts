import { getLlmConfig, isLlmConfigured } from "@/app/lib/llm/config";

describe("llm config", () => {
  const originalXai = process.env.XAI_API_KEY;
  const originalLlm = process.env.LLM_API_KEY;
  const originalModel = process.env.LLM_MODEL;

  afterEach(() => {
    process.env.XAI_API_KEY = originalXai;
    process.env.LLM_API_KEY = originalLlm;
    process.env.LLM_MODEL = originalModel;
  });

  it("ist ohne Key nicht konfiguriert", () => {
    delete process.env.XAI_API_KEY;
    delete process.env.LLM_API_KEY;
    expect(isLlmConfigured()).toBe(false);
  });

  it("nutzt xAI-Defaults", () => {
    process.env.XAI_API_KEY = "xai-test-key-123456789";
    delete process.env.LLM_MODEL;
    const config = getLlmConfig();
    expect(config.provider).toBe("grok");
    expect(config.baseUrl).toContain("x.ai");
    expect(config.model).toBe("grok-4.3");
    expect(isLlmConfigured()).toBe(true);
  });

  it("erlaubt Modell-Override per Env", () => {
    process.env.LLM_MODEL = "grok-4.3";
    expect(getLlmConfig().model).toBe("grok-4.3");
  });
});
