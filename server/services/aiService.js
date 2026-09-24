import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  IT_SUPPORT_SYSTEM_PROMPT,
  TICKET_CLASSIFICATION_PROMPT,
} from './aiPrompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Universal AI Service Adapter
 * Seamlessly supports:
 *  - Groq (ultra-fast Llama-3.3, Llama-3.1, Mixtral)
 *  - Google Gemini (Gemini 1.5 Flash, Pro)
 *  - OpenAI (GPT-4o, GPT-4o-mini)
 *  - Any OpenAI-compatible endpoint (Ollama, DeepSeek, OpenRouter, Mistral, LocalAI)
 */
export class UniversalAIService {
  constructor() {
    this.providerConfigs = {
      groq: {
        baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
        defaultModel: 'openai/gpt-oss-120b',
        type: 'openai-compatible',
      },
      gemini: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
        defaultModel: 'gemini-1.5-flash',
        type: 'gemini',
      },
      openai: {
        baseUrl: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-4o-mini',
        type: 'openai-compatible',
      },
      custom: {
        baseUrl: 'http://localhost:11434/v1/chat/completions',
        defaultModel: 'llama3',
        type: 'openai-compatible',
      },
    };
  }

  get provider() {
    return (process.env.AI_PROVIDER || 'groq').toLowerCase();
  }

  get apiKey() {
    return (
      process.env.AI_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      ''
    ).trim();
  }

  get config() {
    return this.providerConfigs[this.provider] || this.providerConfigs.custom;
  }

  get modelName() {
    return process.env.AI_MODEL || this.config.defaultModel;
  }

  get baseUrl() {
    return process.env.AI_BASE_URL || this.config.baseUrl;
  }

  /**
   * Check if an active API key or custom endpoint is configured
   */
  hasApiKey() {
    if (this.provider === 'custom' && !this.apiKey) {
      return Boolean(process.env.AI_BASE_URL);
    }
    return Boolean(this.apiKey && this.apiKey.trim() !== '');
  }

  /**
   * OpenAI & Groq & OpenAI-compatible (Ollama/DeepSeek/OpenRouter) Adapter
   */
  async callOpenAiCompatible(systemPrompt, userMessages, temperature = 0.4) {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    userMessages.forEach((msg) => {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      });
    });

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelName,
        messages,
        temperature,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`[${this.provider.toUpperCase()} API Error] ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * Google Gemini Native Adapter
   */
  async callGemini(systemPrompt, userMessages, temperature = 0.4) {
    const url = `${this.baseUrl}/${this.modelName}:generateContent?key=${this.apiKey}`;

    const contents = [];
    if (systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: `[SYSTEM INSTRUCTIONS]:\n${systemPrompt}` }],
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I will follow these instructions precisely.' }],
      });
    }

    userMessages.forEach((msg) => {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`[GEMINI API Error] ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  /**
   * Universal Chat Generation
   */
  async generateChatResponse(conversationHistory, customContext = '') {
    if (!this.hasApiKey()) {
      return null;
    }

    const systemPrompt = customContext
      ? `${IT_SUPPORT_SYSTEM_PROMPT}\n\n[COMPANY KNOWLEDGE & GUIDES]:\n${customContext}`
      : IT_SUPPORT_SYSTEM_PROMPT;

    try {
      if (this.provider === 'gemini') {
        return await this.callGemini(systemPrompt, conversationHistory);
      }
      // Groq, OpenAI, DeepSeek, Ollama all use the OpenAI-compatible spec
      return await this.callOpenAiCompatible(systemPrompt, conversationHistory);
    } catch (error) {
      console.warn(`[AI Warning] ${this.provider.toUpperCase()} call failed: ${error.message}. Falling back to internal engine.`);
      return null;
    }
  }

  /**
   * Universal Ticket Classification & Suggestion
   */
  async classifyTicket(issueDescription) {
    if (!this.hasApiKey()) {
      return null;
    }

    const messages = [{ role: 'user', content: `Classify this IT problem:\n"${issueDescription}"` }];

    try {
      let rawText = '';
      if (this.provider === 'gemini') {
        rawText = await this.callGemini(TICKET_CLASSIFICATION_PROMPT, messages, 0.1);
      } else {
        rawText = await this.callOpenAiCompatible(TICKET_CLASSIFICATION_PROMPT, messages, 0.1);
      }

      // Strip markdown code fences if model enclosed JSON in ```json ... ```
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.warn(`[AI Classify Warning] ${this.provider.toUpperCase()} classification failed: ${error.message}. Falling back.`);
      return null;
    }
  }
}

export const aiService = new UniversalAIService();
