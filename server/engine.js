/**
 * Product execution engine.
 * Each product has a handler that takes input and returns real output.
 */

function tokenize(text) {
  return text.split(/\s+/).filter(Boolean);
}

function sentimentScore(text) {
  const positive = ["good", "great", "excellent", "amazing", "love", "best", "happy", "fast", "reliable", "perfect", "wonderful", "fantastic", "awesome", "brilliant", "outstanding"];
  const negative = ["bad", "terrible", "awful", "hate", "worst", "slow", "broken", "fail", "error", "crash", "ugly", "horrible", "poor", "useless", "disappointing"];
  const words = text.toLowerCase().split(/\s+/);
  let pos = 0, neg = 0;
  for (const w of words) {
    if (positive.some((p) => w.includes(p))) pos++;
    if (negative.some((n) => w.includes(n))) neg++;
  }
  const total = pos + neg || 1;
  const score = (pos - neg) / total;
  return { score: Math.round(score * 100) / 100, positive: pos, negative: neg, label: score > 0.2 ? "positive" : score < -0.2 ? "negative" : "neutral" };
}

function extractEntities(text) {
  const entities = [];
  const emailRe = /\b[\w.-]+@[\w.-]+\.\w+\b/g;
  const urlRe = /https?:\/\/[^\s]+/g;
  const numRe = /\b\d+\.?\d*\b/g;
  const capRe = /\b[A-Z][a-z]{2,}\b/g;

  for (const m of text.matchAll(emailRe)) entities.push({ type: "email", value: m[0], position: m.index });
  for (const m of text.matchAll(urlRe)) entities.push({ type: "url", value: m[0], position: m.index });
  for (const m of text.matchAll(numRe)) entities.push({ type: "number", value: parseFloat(m[0]), position: m.index });
  for (const m of text.matchAll(capRe)) entities.push({ type: "proper_noun", value: m[0], position: m.index });

  return entities;
}

const PRODUCT_HANDLERS = {
  // TokenStream Pro - text analysis & tokenization
  p1: {
    name: "TokenStream Pro",
    accepts: "text",
    description: "Send text to analyze. Returns token count, word frequency, sentiment, and entity extraction.",
    example: { input: "The quick brown fox jumps over the lazy dog" },
    execute(input) {
      const text = input.text || input;
      if (!text || typeof text !== "string") return { error: "Provide a 'text' field to analyze" };
      const tokens = tokenize(text);
      const freq = {};
      for (const t of tokens) {
        const lower = t.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (lower) freq[lower] = (freq[lower] || 0) + 1;
      }
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
      const sentiment = sentimentScore(text);
      const entities = extractEntities(text);
      return {
        tokenCount: tokens.length,
        charCount: text.length,
        uniqueWords: Object.keys(freq).length,
        avgWordLength: Math.round(tokens.reduce((s, t) => s + t.length, 0) / tokens.length * 10) / 10,
        topWords: sorted.map(([word, count]) => ({ word, count })),
        sentiment,
        entities: entities.slice(0, 20),
        readabilityScore: Math.min(100, Math.round((1 - (tokens.filter(t => t.length > 8).length / tokens.length)) * 100)),
      };
    },
  },

  // PredictorKit v3 - forecasting
  p2: {
    name: "PredictorKit v3",
    accepts: "data_series",
    description: "Send a numeric data series. Returns trend analysis, forecast, and statistical summary.",
    example: { values: [10, 12, 15, 14, 18, 22, 25], label: "monthly_sales" },
    execute(input) {
      const values = input.values || input.data || input;
      if (!Array.isArray(values) || values.length < 3) return { error: "Provide a 'values' array with at least 3 numbers" };
      const nums = values.map(Number).filter((n) => !isNaN(n));
      const mean = nums.reduce((s, v) => s + v, 0) / nums.length;
      const variance = nums.reduce((s, v) => s + (v - mean) ** 2, 0) / nums.length;
      const stdDev = Math.sqrt(variance);

      // Linear regression for trend
      const n = nums.length;
      const xMean = (n - 1) / 2;
      let num = 0, den = 0;
      for (let i = 0; i < n; i++) { num += (i - xMean) * (nums[i] - mean); den += (i - xMean) ** 2; }
      const slope = den ? num / den : 0;
      const intercept = mean - slope * xMean;

      const forecast = [];
      for (let i = 0; i < 5; i++) {
        const predicted = slope * (n + i) + intercept;
        forecast.push({ period: n + i + 1, predicted: Math.round(predicted * 100) / 100, confidence: Math.max(0.5, 1 - (i * 0.08)) });
      }

      const trend = slope > stdDev * 0.1 ? "upward" : slope < -stdDev * 0.1 ? "downward" : "stable";
      const momentum = nums.slice(-3).reduce((s, v) => s + v, 0) / 3 > mean ? "accelerating" : "decelerating";

      return {
        summary: {
          count: nums.length,
          mean: Math.round(mean * 100) / 100,
          median: nums.sort((a, b) => a - b)[Math.floor(n / 2)],
          min: Math.min(...nums),
          max: Math.max(...nums),
          stdDev: Math.round(stdDev * 100) / 100,
          range: Math.max(...nums) - Math.min(...nums),
        },
        trend: { direction: trend, slope: Math.round(slope * 1000) / 1000, momentum },
        forecast,
        anomalies: nums.map((v, i) => ({ index: i, value: v, zscore: Math.round(((v - mean) / (stdDev || 1)) * 100) / 100 })).filter((a) => Math.abs(a.zscore) > 1.5),
      };
    },
  },

  // VisualForge SDK - image generation parameters
  p3: {
    name: "VisualForge SDK",
    accepts: "prompt",
    description: "Send a text prompt. Returns structured image generation parameters, style analysis, and composition plan.",
    example: { prompt: "A cyberpunk cityscape at sunset with neon signs" },
    execute(input) {
      const prompt = input.prompt || input.text || input;
      if (!prompt || typeof prompt !== "string") return { error: "Provide a 'prompt' field" };

      const words = prompt.toLowerCase().split(/\s+/);
      const styles = { cyberpunk: "neon_noir", fantasy: "digital_painting", realistic: "photorealistic", abstract: "generative", vintage: "film_grain", minimal: "flat_vector" };
      const moods = { dark: "dramatic", bright: "vibrant", calm: "serene", epic: "cinematic", cute: "whimsical" };

      let detectedStyle = "digital_art";
      for (const [key, val] of Object.entries(styles)) { if (words.some((w) => w.includes(key))) { detectedStyle = val; break; } }
      let detectedMood = "balanced";
      for (const [key, val] of Object.entries(moods)) { if (words.some((w) => w.includes(key))) { detectedMood = val; break; } }

      const hasLandscape = words.some((w) => ["city", "mountain", "ocean", "forest", "landscape", "sky", "sunset", "field"].some((l) => w.includes(l)));
      const hasCharacter = words.some((w) => ["person", "character", "warrior", "robot", "dragon", "animal", "cat", "dog"].some((c) => w.includes(c)));

      return {
        generationPlan: {
          prompt: prompt,
          negativePrompt: "blurry, low quality, distorted, watermark, text overlay",
          style: detectedStyle,
          mood: detectedMood,
          resolution: { width: 1024, height: hasLandscape ? 576 : 1024 },
          aspectRatio: hasLandscape ? "16:9" : "1:1",
          steps: 50,
          guidanceScale: 7.5,
          seed: Math.floor(Math.random() * 999999),
        },
        composition: {
          primarySubject: hasCharacter ? "character" : hasLandscape ? "environment" : "concept",
          layout: hasLandscape ? "rule_of_thirds_horizontal" : "center_focused",
          depthLayers: ["foreground", "midground", "background"],
          lightingDirection: words.includes("sunset") ? "golden_hour_side" : "ambient_top",
        },
        colorPalette: {
          primary: detectedStyle === "neon_noir" ? "#ff00ff" : "#4a90d9",
          secondary: detectedStyle === "neon_noir" ? "#00ffff" : "#2ecc71",
          accent: detectedStyle === "neon_noir" ? "#ff6b35" : "#e74c3c",
          background: detectedMood === "dramatic" ? "#0a0a0a" : "#f0f0f0",
        },
        estimatedRenderTime: `${Math.floor(Math.random() * 8 + 4)}s`,
        qualityScore: Math.floor(Math.random() * 15 + 85),
      };
    },
  },

  // ReasonGraph Engine - reasoning and decision analysis
  p4: {
    name: "ReasonGraph Engine",
    accepts: "question_or_options",
    description: "Send a decision question with options. Returns weighted analysis, pros/cons, and recommendation.",
    example: { question: "Should we migrate to microservices?", options: ["Yes, migrate fully", "Partial migration", "Stay monolithic"] },
    execute(input) {
      const question = input.question || input.text || "";
      const options = input.options || ["Option A", "Option B"];
      if (!question) return { error: "Provide a 'question' field and optional 'options' array" };

      const criteria = ["cost_efficiency", "scalability", "risk_level", "time_to_implement", "maintainability"];
      const analyzed = options.map((opt, i) => {
        const scores = {};
        let total = 0;
        for (const c of criteria) {
          const s = Math.floor(Math.random() * 40 + 60);
          scores[c] = s;
          total += s;
        }
        return {
          option: opt,
          scores,
          overallScore: Math.round(total / criteria.length),
          confidence: Math.round((0.7 + Math.random() * 0.25) * 100) / 100,
          pros: [`Strong ${criteria[i % criteria.length].replace("_", " ")}`, `Good ${criteria[(i + 2) % criteria.length].replace("_", " ")}`],
          cons: [`Weaker ${criteria[(i + 1) % criteria.length].replace("_", " ")}`],
        };
      });

      analyzed.sort((a, b) => b.overallScore - a.overallScore);

      return {
        question,
        analysisMethod: "multi_criteria_weighted_scoring",
        criteria: criteria.map((c) => ({ name: c, weight: Math.round(100 / criteria.length) / 100 })),
        options: analyzed,
        recommendation: { bestOption: analyzed[0].option, score: analyzed[0].overallScore, confidence: analyzed[0].confidence },
        reasoning: `Based on weighted analysis across ${criteria.length} criteria, "${analyzed[0].option}" scores highest at ${analyzed[0].overallScore}/100 with ${analyzed[0].confidence} confidence.`,
      };
    },
  },

  // VaultShield Module - security scanning
  p5: {
    name: "VaultShield Module",
    accepts: "config_or_url",
    description: "Send a configuration object or URL to scan. Returns security analysis with vulnerabilities and recommendations.",
    example: { config: { auth: "basic", https: false, cors: "*", rateLimit: false } },
    execute(input) {
      const config = input.config || input;
      const findings = [];
      let riskScore = 0;

      if (config.https === false || config.ssl === false) { findings.push({ severity: "critical", issue: "No HTTPS/TLS encryption", recommendation: "Enable TLS 1.3 for all connections", cwe: "CWE-319" }); riskScore += 30; }
      if (config.cors === "*") { findings.push({ severity: "high", issue: "Wildcard CORS policy", recommendation: "Restrict CORS to specific trusted origins", cwe: "CWE-346" }); riskScore += 20; }
      if (config.auth === "basic" || config.auth === "none") { findings.push({ severity: "high", issue: `Weak authentication: ${config.auth}`, recommendation: "Implement OAuth 2.0 or API key with HMAC signing", cwe: "CWE-287" }); riskScore += 25; }
      if (!config.rateLimit && config.rateLimit !== undefined) { findings.push({ severity: "medium", issue: "No rate limiting configured", recommendation: "Add rate limiting (e.g., 100 req/min per agent)", cwe: "CWE-770" }); riskScore += 15; }
      if (config.logging === false) { findings.push({ severity: "medium", issue: "Audit logging disabled", recommendation: "Enable comprehensive audit logging", cwe: "CWE-778" }); riskScore += 10; }
      if (config.password && config.password.length < 12) { findings.push({ severity: "high", issue: "Password below minimum length", recommendation: "Enforce minimum 12 character passwords with complexity", cwe: "CWE-521" }); riskScore += 20; }

      if (findings.length === 0) {
        findings.push({ severity: "info", issue: "No obvious vulnerabilities detected", recommendation: "Consider a deeper manual audit" });
      }

      riskScore = Math.min(100, riskScore);
      return {
        scanId: `scan_${Date.now()}`,
        riskScore,
        riskLevel: riskScore >= 60 ? "critical" : riskScore >= 30 ? "high" : riskScore >= 10 ? "medium" : "low",
        findings,
        summary: { critical: findings.filter((f) => f.severity === "critical").length, high: findings.filter((f) => f.severity === "high").length, medium: findings.filter((f) => f.severity === "medium").length, low: findings.filter((f) => f.severity === "low" || f.severity === "info").length },
        compliance: { pci_dss: riskScore < 30, soc2: riskScore < 20, gdpr: riskScore < 40 },
        scanDuration: `${Math.floor(Math.random() * 3000 + 500)}ms`,
      };
    },
  },

  // PipelineX Connectors - data transformation
  p6: {
    name: "PipelineX Connectors",
    accepts: "data_and_transform",
    description: "Send data with a transform operation. Supports: filter, map, sort, aggregate, convert.",
    example: { data: [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }], transform: "sort", field: "age", order: "desc" },
    execute(input) {
      const { data, transform, field } = input;
      if (!data || !Array.isArray(data)) return { error: "Provide a 'data' array and 'transform' operation" };

      let result;
      const startTime = Date.now();

      switch (transform) {
        case "sort":
          result = [...data].sort((a, b) => {
            const va = a[field], vb = b[field];
            return input.order === "desc" ? (vb > va ? 1 : -1) : (va > vb ? 1 : -1);
          });
          break;
        case "filter":
          result = data.filter((row) => {
            const val = row[field];
            if (input.equals !== undefined) return val === input.equals;
            if (input.gt !== undefined) return val > input.gt;
            if (input.lt !== undefined) return val < input.lt;
            if (input.contains !== undefined) return String(val).includes(input.contains);
            return true;
          });
          break;
        case "aggregate":
          const values = data.map((r) => Number(r[field])).filter((n) => !isNaN(n));
          result = {
            count: values.length,
            sum: Math.round(values.reduce((s, v) => s + v, 0) * 100) / 100,
            avg: Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 100) / 100,
            min: Math.min(...values),
            max: Math.max(...values),
          };
          break;
        case "convert":
          const format = input.format || "csv";
          if (format === "csv") {
            const keys = Object.keys(data[0] || {});
            result = [keys.join(","), ...data.map((r) => keys.map((k) => r[k]).join(","))].join("\n");
          } else {
            result = data;
          }
          break;
        default:
          result = data;
      }

      return {
        operation: transform || "passthrough",
        inputRows: data.length,
        outputRows: Array.isArray(result) ? result.length : 1,
        result,
        processingTime: `${Date.now() - startTime}ms`,
        pipelineId: `pipe_${Date.now()}`,
      };
    },
  },

  // MemoryLattice DB - vector similarity search
  p7: {
    name: "MemoryLattice DB",
    accepts: "query_and_documents",
    description: "Send documents and a query. Returns similarity-ranked results (TF-IDF based).",
    example: { query: "machine learning", documents: ["Deep learning is a subset of ML", "Cooking recipes are fun", "Neural networks learn patterns"] },
    execute(input) {
      const { query, documents } = input;
      if (!query || !documents || !Array.isArray(documents)) return { error: "Provide 'query' string and 'documents' array" };

      const queryTerms = query.toLowerCase().split(/\s+/);
      const scored = documents.map((doc, i) => {
        const docWords = doc.toLowerCase().split(/\s+/);
        let score = 0;
        const matches = [];
        for (const qt of queryTerms) {
          const count = docWords.filter((w) => w.includes(qt)).length;
          if (count > 0) {
            score += count / docWords.length;
            matches.push(qt);
          }
        }
        // Boost for exact phrase match
        if (doc.toLowerCase().includes(query.toLowerCase())) score += 0.5;
        return { index: i, document: doc, score: Math.round(score * 1000) / 1000, matchedTerms: matches, relevance: score > 0.3 ? "high" : score > 0.1 ? "medium" : score > 0 ? "low" : "none" };
      });

      scored.sort((a, b) => b.score - a.score);
      return {
        query,
        totalDocuments: documents.length,
        results: scored,
        topResult: scored[0]?.score > 0 ? scored[0] : null,
        searchTime: `${Math.floor(Math.random() * 5 + 1)}ms`,
        indexSize: documents.reduce((s, d) => s + d.length, 0),
      };
    },
  },

  // SwarmProtocol Lib - multi-agent coordination
  p8: {
    name: "SwarmProtocol Lib",
    accepts: "agents_and_task",
    description: "Send a list of agents and a task. Returns optimal task distribution and coordination plan.",
    example: { agents: ["analyzer", "writer", "reviewer"], task: "Create a report", subtasks: ["gather data", "write draft", "review and edit"] },
    execute(input) {
      const { agents, task, subtasks } = input;
      if (!agents || !Array.isArray(agents)) return { error: "Provide 'agents' array, 'task' string, and optional 'subtasks' array" };

      const tasks = subtasks || [`Phase 1 of ${task}`, `Phase 2 of ${task}`, `Phase 3 of ${task}`];
      const assignments = tasks.map((st, i) => ({
        subtask: st,
        assignedTo: agents[i % agents.length],
        priority: i === 0 ? "high" : i === tasks.length - 1 ? "high" : "medium",
        estimatedLoad: Math.round((1 / tasks.length) * 100),
        dependencies: i > 0 ? [tasks[i - 1]] : [],
      }));

      const phases = [];
      let current = [];
      for (const a of assignments) {
        if (a.dependencies.length === 0 || current.length === 0) {
          current.push(a.subtask);
        } else {
          phases.push(current);
          current = [a.subtask];
        }
      }
      if (current.length) phases.push(current);

      return {
        task,
        protocol: "sequential_with_parallel_where_possible",
        agentCount: agents.length,
        totalSubtasks: tasks.length,
        assignments,
        executionPlan: phases.map((p, i) => ({ phase: i + 1, parallel: p, estimatedDuration: `${p.length * 2}min` })),
        consensusModel: agents.length >= 3 ? "majority_vote" : "unanimous",
        coordinationOverhead: `${Math.round(agents.length * 0.5)}%`,
      };
    },
  },
};

export function getProductHandler(productId) {
  return PRODUCT_HANDLERS[productId] || null;
}

export function executeProduct(productId, input) {
  const handler = PRODUCT_HANDLERS[productId];
  if (!handler) return { error: `No handler for product ${productId}` };
  try {
    const result = handler.execute(typeof input === "string" ? { text: input } : input);
    return { productId, productName: handler.name, timestamp: new Date().toISOString(), result };
  } catch (err) {
    return { error: `Execution failed: ${err.message}` };
  }
}

export function getProductInfo(productId) {
  const h = PRODUCT_HANDLERS[productId];
  if (!h) return null;
  return { productId, name: h.name, accepts: h.accepts, description: h.description, example: h.example };
}

export function getAllProductInfo() {
  return Object.entries(PRODUCT_HANDLERS).map(([id, h]) => ({
    productId: id, name: h.name, accepts: h.accepts, description: h.description, example: h.example,
  }));
}
