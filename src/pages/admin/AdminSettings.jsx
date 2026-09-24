import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import {
  Bot,
  Zap,
  Activity,
  Server,
  Key,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Cpu,
  Globe,
} from 'lucide-react';

export default function AdminSettings() {
  const [aiConfig, setAiConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live Diagnostic Test State
  const [testingAi, setTestingAi] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const loadAiConfig = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/ai/config');
      if (res.success) {
        setAiConfig(res.data);
      }
    } catch (err) {
      console.error('Failed to load AI config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAiConfig();
  }, []);

  const handleTestConnection = async () => {
    setTestingAi(true);
    setTestResult(null);
    try {
      const res = await apiRequest('/ai/test', { method: 'POST' });
      setTestResult({
        success: res.success,
        latencyMs: res.latencyMs,
        provider: res.provider,
        model: res.model,
        response: res.response,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setTestingAi(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              System Settings
            </span>
          </div>
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">
            AI Engine & Platform Configuration
          </h1>
          <p className="text-[13px] text-[#737373]">
            Inspect runtime LLM providers, conduct diagnostic latency benchmarks, and manage platform parameters
          </p>
        </div>
      </div>

      {/* ─── Universal AI Architecture Card ─────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-6 space-y-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between border-b border-[#f5f5f5] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#0a0a0a] flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-base text-[#0a0a0a]">
                Universal AI Inference Provider
              </h2>
              <p className="text-[12px] text-[#737373]">
                Plug-and-play LLM architecture supporting multi-provider fallback
              </p>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testingAi}
            className="px-4 py-2 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[12px] font-medium rounded-[8px] transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-400 ${testingAi ? 'animate-bounce' : ''}`} />
            <span>{testingAi ? 'Running Live Diagnostic...' : 'Test AI Connection'}</span>
          </button>
        </div>

        {/* Provider Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'groq',
              name: 'Groq Cloud',
              model: 'openai/gpt-oss-120b',
              desc: 'Ultra-low latency LPUs (Sub-second token streaming)',
              active: aiConfig?.provider === 'groq',
            },
            {
              id: 'gemini',
              name: 'Google Gemini',
              model: 'gemini-1.5-flash',
              desc: 'High context token window & multimodal grounding',
              active: aiConfig?.provider === 'gemini',
            },
            {
              id: 'openai',
              name: 'OpenAI API',
              model: 'gpt-4o-mini',
              desc: 'Industry standard enterprise GPT reasoning',
              active: aiConfig?.provider === 'openai',
            },
            {
              id: 'custom',
              name: 'Local Ollama / Custom',
              model: 'llama3:latest',
              desc: 'Self-hosted air-gapped on-premise inference',
              active: aiConfig?.provider === 'custom',
            },
          ].map((prov) => (
            <div
              key={prov.id}
              className={`p-4 rounded-[12px] border transition-all space-y-2 ${
                prov.active
                  ? 'bg-blue-50/40 border-[#2563eb] shadow-sm'
                  : 'bg-[#fafafa] border-[#e5e5e5] opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[13px] text-[#0a0a0a]">{prov.name}</span>
                {prov.active ? (
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    ACTIVE
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#737373]">AVAILABLE</span>
                )}
              </div>
              <div className="font-mono text-[11px] text-[#2563eb] font-medium truncate">
                {prov.model}
              </div>
              <p className="text-[11px] text-[#737373] line-clamp-2">{prov.desc}</p>
            </div>
          ))}
        </div>

        {/* Live Diagnostic Result Box */}
        {testResult && (
          <div
            className={`p-4 rounded-[12px] border text-[13px] space-y-2 ${
              testResult.success
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-red-50/70 border-red-200 text-red-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span>
                  {testResult.success
                    ? 'AI Diagnostics Passed Successfully'
                    : 'AI Diagnostics Check Failed'}
                </span>
              </div>
              {testResult.latencyMs && (
                <span className="font-mono text-[11px] font-bold bg-white/80 px-2 py-0.5 rounded border border-emerald-300">
                  Latency: {testResult.latencyMs}ms
                </span>
              )}
            </div>

            {testResult.response && (
              <div className="p-3 bg-white/90 rounded-[8px] border border-emerald-200 font-mono text-[12px] text-[#0a0a0a]">
                <strong>AI Model Response:</strong> "{testResult.response}"
              </div>
            )}

            {testResult.message && (
              <div className="text-[12px] text-red-700">{testResult.message}</div>
            )}
          </div>
        )}
      </div>

      {/* ─── Platform Infrastructure Card ───────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-6 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <h3 className="font-display font-semibold text-base text-[#0a0a0a] flex items-center gap-2">
          <Server className="w-4 h-4 text-[#2563eb]" />
          <span>Platform Stack & Runtime Environment</span>
        </h3>

        <div className="grid sm:grid-cols-3 gap-4 text-[13px]">
          <div className="p-3.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[10px] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#737373]">Database Engine</span>
            <div className="font-mono font-semibold text-[#0a0a0a]">MongoDB 7.x (Active)</div>
          </div>

          <div className="p-3.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[10px] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#737373]">Backend Runtime</span>
            <div className="font-mono font-semibold text-[#0a0a0a]">Node.js Express REST</div>
          </div>

          <div className="p-3.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[10px] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#737373]">Frontend Client</span>
            <div className="font-mono font-semibold text-[#0a0a0a]">Vite React + Vanilla CSS</div>
          </div>
        </div>
      </div>
    </div>
  );
}
