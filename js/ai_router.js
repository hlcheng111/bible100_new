/**
 * Bible100 AI Router
 * 路由到本地規則引擎或外部 LLM
 * 對齊 IMPLEMENTATION_SUPPLEMENT_V1.md 規格
 */
(function (global) {
  "use strict";

  function getCloudConfig() {
    if (global.cloudConfig && typeof global.cloudConfig.USE_API !== "undefined") {
      return global.cloudConfig;
    }
    return { USE_API: false, AI_PROVIDER: 'openai', AI_API_KEY: '', AI_API_URL: '', AI_MODEL: 'gpt-3.5-turbo' };
  }

  function isOnline() {
    if (typeof navigator !== "undefined" && navigator.onLine !== undefined) {
      return navigator.onLine;
    }
    return true;
  }

  function hasApiKey() {
    var config = getCloudConfig();
    return config.USE_API && config.AI_API_KEY && config.AI_API_KEY.length > 0;
  }

  async function callExternalLLM(prompt, options) {
    if (!hasApiKey()) {
      throw new Error("No API key configured");
    }

    var config = getCloudConfig();
    var provider = config.AI_PROVIDER || "openai";

    if (provider === "openai") {
      return await callOpenAI(prompt, config, options);
    } else if (provider === "anthropic") {
      return await callAnthropic(prompt, config, options);
    } else {
      throw new Error("Unsupported provider: " + provider);
    }
  }

  async function callOpenAI(prompt, config, options) {
    var apiKey = config.AI_API_KEY;
    var apiUrl = config.AI_API_URL || "https://api.openai.com/v1/chat/completions";
    var model = config.AI_MODEL || "gpt-3.5-turbo";

    try {
      var response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: "你是聖經教材助手，不是神學權威。AI 草稿需經牧者審核。" },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: options.maxTokens || 1000
        })
      });

      if (!response.ok) {
        throw new Error("API request failed: " + response.status);
      }

      var data = await response.json();
      return {
        ok: true,
        source: "external_llm",
        provider: "openai",
        text: data.choices[0].message.content,
        meta: {
          source: "external_llm",
          provider: "openai",
          model: model,
          trust_badge: "ai_draft",
          human_review_required: true
        }
      };
    } catch (error) {
      console.warn("External LLM call failed:", error);
      throw error;
    }
  }

  async function callAnthropic(prompt, config, options) {
    var apiKey = config.AI_API_KEY;
    var apiUrl = config.AI_API_URL || "https://api.anthropic.com/v1/messages";
    var model = config.AI_MODEL || "claude-3-haiku-20240307";

    try {
      var response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: model,
          max_tokens: options.maxTokens || 1000,
          messages: [
            { role: "user", content: prompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error("API request failed: " + response.status);
      }

      var data = await response.json();
      return {
        ok: true,
        source: "external_llm",
        provider: "anthropic",
        text: data.content[0].text,
        meta: {
          source: "external_llm",
          provider: "anthropic",
          model: model,
          trust_badge: "ai_draft",
          human_review_required: true
        }
      };
    } catch (error) {
      console.warn("External LLM call failed:", error);
      throw error;
    }
  }

  async function route(request) {
    var pack = request.pack || "lesson_prep";
    var input = request.input || {};
    var options = request.options || {};

    var config = getCloudConfig();
    var online = isOnline();
    var hasKey = hasApiKey();

    if (!config.USE_API || !online || !hasKey) {
      console.log("Using local rules engine (USE_API:", config.USE_API, ", online:", online, ", hasKey:", hasKey, ")");
      return global.AiLocalRules.run(pack, input);
    }

    try {
      console.log("Attempting external LLM call...");
      var result = await callExternalLLM(request.prompt, options);
      
      result.meta.pack = pack;
      result.meta.human_review_required = true;
      
      return result;
    } catch (error) {
      console.warn("External LLM failed, falling back to local rules:", error);
      return global.AiLocalRules.run(pack, input);
    }
  }

  global.AiRouter = {
    route: route,
    isOnline: isOnline,
    hasApiKey: hasApiKey,
    getCloudConfig: getCloudConfig
  };
})(typeof window !== "undefined" ? window : this);
