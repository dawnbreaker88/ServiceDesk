import React, { useState } from 'react';
import {
  MessageSquare,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Clock,
  GitBranch,
  ShieldCheck,
  Users,
  UserCheck,
  UserCog,
  Briefcase,
  ArrowRight,
  Sparkles,
  Layers,
  Search,
  Laptop,
  Check,
  ChevronRight,
  Flame,
  Terminal,
  Server
} from 'lucide-react';

export default function LandingPage({ onNavigateToApp }) {
  // Interactive Hero Demo State
  const [demoStep, setDemoStep] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState('AST-LP-001');

  // Interactive Role Preview State
  const [activeRole, setActiveRole] = useState('employees');

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#171717] font-sans antialiased selection:bg-[#2563eb]/10 selection:text-[#2563eb]">
      {/* ─── Top Navigation Bar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#ffffff]/90 backdrop-blur-md border-b border-[#e5e5e5]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[#0a0a0a] flex items-center justify-center text-white font-mono text-sm font-semibold tracking-wider">
              SD
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-[#0a0a0a]">
              ServiceDesk<span className="text-[#2563eb]">.</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[14px] text-[#525252] font-medium">
            <a href="#how-it-works" className="hover:text-[#0a0a0a] transition-colors">
              How it works
            </a>
            <a href="#it-features" className="hover:text-[#0a0a0a] transition-colors">
              Platform
            </a>
            <a href="#context-engine" className="hover:text-[#0a0a0a] transition-colors">
              Context
            </a>
            <a href="#roles" className="hover:text-[#0a0a0a] transition-colors">
              Roles
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToApp}
              className="px-4 py-2 text-[14px] font-medium text-[#171717] border border-[#e5e5e5] rounded-[8px] hover:bg-[#f5f5f5] transition-all"
            >
              Sign In
            </button>
            <button
              onClick={onNavigateToApp}
              className="px-4 py-2 text-[14px] font-medium text-white bg-[#0a0a0a] rounded-[8px] hover:bg-[#262626] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-24 overflow-hidden bg-grid-pattern border-b border-[#e5e5e5]">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Eyebrow Pill */}
          <div className="flex items-center gap-2 max-w-fit mx-auto px-3.5 py-1.5 rounded-[9999px] bg-[#ffffff] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.02)] mb-8">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
            <span className="text-[13px] font-medium text-[#404040]">
              ServiceDesk Pro
            </span>
            <span className="text-[#a3a3a3]">•</span>
            <span className="text-[13px] text-[#737373]">Self-Service IT Helpdesk</span>
          </div>

          {/* Headline & Description */}
          <div className="text-center max-w-[840px] mx-auto">
            <h1 className="font-display font-medium text-4xl sm:text-5xl md:text-6xl text-[#0a0a0a] tracking-tight leading-[1.08] mb-6">
              Resolve more IT issues before they become tickets.
            </h1>
            <p className="text-[16px] md:text-[18px] text-[#525252] leading-relaxed max-w-[680px] mx-auto mb-10">
              Employees describe what's wrong in their own words. ServiceDesk guides them through troubleshooting, gathers the right context, and creates a structured ticket when IT needs to step in.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
              <button
                onClick={onNavigateToApp}
                className="px-6 py-3 text-[15px] font-medium text-white bg-[#0a0a0a] rounded-[8px] hover:bg-[#262626] transition-all shadow-sm flex items-center gap-2 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={onNavigateToApp}
                className="px-6 py-3 text-[15px] font-medium text-[#171717] bg-[#ffffff] border border-[#e5e5e5] rounded-[8px] hover:bg-[#f5f5f5] transition-all"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Hero Interactive Raycast / Linear Inspired Widget Mockup */}
          <div className="max-w-[1000px] mx-auto bg-[#ffffff] rounded-[16px] border border-[#e5e5e5] p-2 sm:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
            <div className="bg-[#fafafa] rounded-[12px] border border-[#e5e5e5] overflow-hidden">
              {/* Window Bar */}
              <div className="px-4 py-3 bg-[#ffffff] border-b border-[#e5e5e5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#e5e5e5]" />
                  <div className="w-3 h-3 rounded-full bg-[#e5e5e5]" />
                  <div className="w-3 h-3 rounded-full bg-[#e5e5e5]" />
                  <span className="ml-3 font-mono text-[12px] text-[#737373]">
                    servicedesk.internal / triage
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-[9999px] bg-[#dcfce7] text-[#16a34a] text-[11px] font-medium">
                    ● Live Diagnostic Engine
                  </span>
                </div>
              </div>

              {/* Interactive Demo Content */}
              <div className="p-6 md:p-8 grid md:grid-cols-12 gap-6 bg-[#ffffff]">
                {/* Left: Interactive Troubleshooting Stream */}
                <div className="md:col-span-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#e5e5e5] md:pr-6 pb-6 md:pb-0">
                  <div>
                    <div className="text-[12px] font-mono uppercase tracking-wider text-[#737373] mb-4">
                      Step-by-step Triage Simulation
                    </div>

                    {/* Chat Bubble 1: Employee */}
                    <div className="flex gap-3 mb-4">
                      <div className="w-7 h-7 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-xs font-semibold text-[#525252]">
                        P
                      </div>
                      <div className="bg-[#f5f5f5] border border-[#e5e5e5] rounded-[10px] rounded-tl-none p-3.5 text-[14px] text-[#171717] max-w-[85%]">
                        My MacBook cannot connect to the office <span className="font-mono text-[12px] px-1 bg-white border border-[#e5e5e5] rounded">Corp-Secure</span> Wi-Fi network on the 4th floor.
                      </div>
                    </div>

                    {/* Chat Bubble 2: Assistant */}
                    <div className="flex gap-3 mb-4">
                      <div className="w-7 h-7 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center text-xs font-semibold">
                        SD
                      </div>
                      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[10px] rounded-tl-none p-3.5 text-[14px] text-[#171717] max-w-[90%] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <p className="font-medium text-[#0a0a0a] mb-1">
                          Network Diagnostic: Wi-Fi Interface Reset
                        </p>
                        <p className="text-[#525252] text-[13px] leading-relaxed mb-3">
                          1. Toggle Wi-Fi Off, wait 5 seconds, and toggle it back On.<br />
                          2. Forget "Corp-Secure" network and reconnect with domain credentials.
                        </p>
                        
                        {/* Interactive Action Buttons inside widget */}
                        <div className="flex flex-wrap gap-2 pt-1 border-t border-[#f5f5f5]">
                          <button
                            onClick={() => setDemoStep(2)}
                            className={`px-3 py-1.5 text-[12px] font-medium rounded-[6px] transition-all ${
                              demoStep === 2
                                ? 'bg-[#dcfce7] text-[#16a34a] border border-[#16a34a]/30'
                                : 'bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#171717]'
                            }`}
                          >
                            ✓ Solved my issue
                          </button>
                          <button
                            onClick={() => setDemoStep(3)}
                            className={`px-3 py-1.5 text-[12px] font-medium rounded-[6px] transition-all ${
                              demoStep === 3
                                ? 'bg-[#0a0a0a] text-white'
                                : 'bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#171717]'
                            }`}
                          >
                            Still broken → Escalate
                          </button>
                        </div>
                      </div>
                    </div>

                    {demoStep === 2 && (
                      <div className="p-3 bg-[#dcfce7]/60 border border-[#16a34a]/30 rounded-[8px] text-[13px] text-[#16a34a] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>Self-service resolved in 45 seconds without creating ticket overhead!</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#f5f5f5] flex items-center justify-between text-[12px] text-[#737373]">
                    <span>Interactive Preview</span>
                    <span>Click options to test workflow</span>
                  </div>
                </div>

                {/* Right: Real-time Ticket & Asset Context Preview */}
                <div className="md:col-span-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[11px] text-[#737373] uppercase tracking-wider">
                        Auto-Context Package
                      </span>
                      <span className="font-mono text-[11px] text-[#2563eb] font-medium">
                        SD-1048
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Requester Box */}
                      <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]">
                        <div className="text-[11px] text-[#737373] uppercase font-mono">Requester</div>
                        <div className="text-[14px] font-medium text-[#0a0a0a]">Prabhath Perera</div>
                        <div className="text-[12px] text-[#525252]">Engineering Wing • 4th Floor</div>
                      </div>

                      {/* Hardware Asset Box */}
                      <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-[#737373] uppercase font-mono">Linked Hardware</span>
                          <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 border border-[#e5e5e5] rounded text-[#0a0a0a]">
                            AST-LP-001
                          </span>
                        </div>
                        <div className="text-[13px] font-medium text-[#0a0a0a]">MacBook Pro 16" M3 Max</div>
                        <div className="text-[12px] text-[#16a34a] flex items-center gap-1 mt-0.5">
                          <Check className="w-3 h-3" /> AppleCare Active (Exp. 2027)
                        </div>
                      </div>

                      {/* SLA Commitment */}
                      <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-[#737373] uppercase font-mono">Priority & SLA</div>
                          <div className="text-[13px] font-medium text-[#0a0a0a]">HIGH • 30m Response</div>
                        </div>
                        <span className="font-mono text-[12px] text-[#2563eb] font-semibold">
                          24m Left
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 text-right">
                    <span className="text-[11px] font-mono text-[#a3a3a3]">
                      Zero manual forms required
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 1: From problem to resolution ──────────────────── */}
      <section id="how-it-works" className="py-24 border-b border-[#e5e5e5] bg-[#fafafa]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-14">
            <span className="text-[12px] font-mono uppercase tracking-[0.18em] text-[#737373]">
              Workflow
            </span>
            <h2 className="font-display font-medium text-3xl md:text-4xl text-[#0a0a0a] tracking-tight mt-2">
              From problem to resolution.
            </h2>
          </div>

          {/* 4-Step Bento Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 01 */}
            <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[12px] p-6 flex flex-col justify-between hover:border-[#d4d4d4] transition-all">
              <div>
                <div className="w-10 h-10 rounded-[8px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#171717] mb-6">
                  <MessageSquare className="w-5 h-5 text-[#0a0a0a]" />
                </div>
                <div className="font-mono text-[12px] text-[#737373] font-semibold mb-1">
                  01 — Describe
                </div>
                <h3 className="font-display font-semibold text-[18px] text-[#0a0a0a] mb-2">
                  Plain English Input
                </h3>
                <p className="text-[14px] text-[#525252] leading-relaxed">
                  Employees explain the problem naturally instead of filling out complicated forms.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#f5f5f5] text-[12px] font-mono text-[#737373]">
                Natural Language Intake
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[12px] p-6 flex flex-col justify-between hover:border-[#d4d4d4] transition-all">
              <div>
                <div className="w-10 h-10 rounded-[8px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#171717] mb-6">
                  <Wrench className="w-5 h-5 text-[#0a0a0a]" />
                </div>
                <div className="font-mono text-[12px] text-[#737373] font-semibold mb-1">
                  02 — Troubleshoot
                </div>
                <h3 className="font-display font-semibold text-[18px] text-[#0a0a0a] mb-2">
                  Guided Resolution
                </h3>
                <p className="text-[14px] text-[#525252] leading-relaxed">
                  ServiceDesk Pro guides them through relevant troubleshooting steps.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#f5f5f5] text-[12px] font-mono text-[#737373]">
                Knowledge Guide Trees
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[12px] p-6 flex flex-col justify-between hover:border-[#d4d4d4] transition-all">
              <div>
                <div className="w-10 h-10 rounded-[8px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#171717] mb-6">
                  <AlertCircle className="w-5 h-5 text-[#0a0a0a]" />
                </div>
                <div className="font-mono text-[12px] text-[#737373] font-semibold mb-1">
                  03 — Escalate
                </div>
                <h3 className="font-display font-semibold text-[18px] text-[#0a0a0a] mb-2">
                  Automatic Context Hand-off
                </h3>
                <p className="text-[14px] text-[#525252] leading-relaxed">
                  If the issue needs IT, a structured ticket is created with the relevant context.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#f5f5f5] text-[12px] font-mono text-[#737373]">
                Auto-SLA & Hardware Link
              </div>
            </div>

            {/* Step 04 */}
            <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[12px] p-6 flex flex-col justify-between hover:border-[#d4d4d4] transition-all">
              <div>
                <div className="w-10 h-10 rounded-[8px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#171717] mb-6">
                  <CheckCircle2 className="w-5 h-5 text-[#0a0a0a]" />
                </div>
                <div className="font-mono text-[12px] text-[#737373] font-semibold mb-1">
                  04 — Resolve
                </div>
                <h3 className="font-display font-semibold text-[18px] text-[#0a0a0a] mb-2">
                  Unified Workstation
                </h3>
                <p className="text-[14px] text-[#525252] leading-relaxed">
                  Technicians take over, communicate with the employee, and resolve the issue from one workspace.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#f5f5f5] text-[12px] font-mono text-[#737373]">
                Work Logs & Audit Trail
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 2: Everything IT needs after the ticket is created ─ */}
      <section id="it-features" className="py-24 border-b border-[#e5e5e5] bg-[#ffffff]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-14">
            <span className="text-[12px] font-mono uppercase tracking-[0.18em] text-[#737373]">
              Capabilities
            </span>
            <h2 className="font-display font-medium text-3xl md:text-4xl text-[#0a0a0a] tracking-tight mt-2">
              Everything IT needs after the ticket is created.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1: Tickets */}
            <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[12px] p-8 hover:border-[#d4d4d4] transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-[8px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center">
                  <Layers className="w-5 h-5 text-[#0a0a0a]" />
                </div>
                <span className="font-mono text-[11px] text-[#737373] uppercase tracking-wider">
                  State Machine
                </span>
              </div>
              <h3 className="font-display font-semibold text-2xl text-[#0a0a0a] mb-2">
                Tickets
              </h3>
              <p className="text-[15px] text-[#525252] leading-relaxed mb-6">
                Assign, prioritize, track, and resolve support requests.
              </p>
              <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] font-mono text-[12px] text-[#525252] flex items-center justify-between">
                <span>OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED</span>
              </div>
            </div>

            {/* Card 2: Assets */}
            <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[12px] p-8 hover:border-[#d4d4d4] transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-[8px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-[#0a0a0a]" />
                </div>
                <span className="font-mono text-[11px] text-[#737373] uppercase tracking-wider">
                  Lifecycle
                </span>
              </div>
              <h3 className="font-display font-semibold text-2xl text-[#0a0a0a] mb-2">
                Assets
              </h3>
              <p className="text-[15px] text-[#525252] leading-relaxed mb-6">
                See the device involved, its assignment, warranty, and history.
              </p>
              <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] font-mono text-[12px] text-[#525252] flex items-center justify-between">
                <span>AST-LP-001 • MacBook Pro 16" • AppleCare Active</span>
              </div>
            </div>

            {/* Card 3: SLA */}
            <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[12px] p-8 hover:border-[#d4d4d4] transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-[8px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#0a0a0a]" />
                </div>
                <span className="font-mono text-[11px] text-[#737373] uppercase tracking-wider">
                  Guarantees
                </span>
              </div>
              <h3 className="font-display font-semibold text-2xl text-[#0a0a0a] mb-2">
                SLA
              </h3>
              <p className="text-[15px] text-[#525252] leading-relaxed mb-6">
                Track response and resolution commitments before they become overdue.
              </p>
              <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] font-mono text-[12px] text-[#525252] flex items-center justify-between">
                <span>Critical: 15m response • High: 30m • Medium: 2h</span>
              </div>
            </div>

            {/* Card 4: Workflows */}
            <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[12px] p-8 hover:border-[#d4d4d4] transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-[8px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-[#0a0a0a]" />
                </div>
                <span className="font-mono text-[11px] text-[#737373] uppercase tracking-wider">
                  Collaboration
                </span>
              </div>
              <h3 className="font-display font-semibold text-2xl text-[#0a0a0a] mb-2">
                Workflows
              </h3>
              <p className="text-[15px] text-[#525252] leading-relaxed mb-6">
                Keep technicians, managers, and administrators working from the same system.
              </p>
              <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] font-mono text-[12px] text-[#525252] flex items-center justify-between">
                <span>RBAC Security • Public Comments • Internal Tech Notes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 3: Keep every request connected to its context ─── */}
      <section id="context-engine" className="py-24 border-b border-[#e5e5e5] bg-[#fafafa]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="text-[12px] font-mono uppercase tracking-[0.18em] text-[#737373]">
                Context Engine
              </span>
              <h2 className="font-display font-medium text-3xl md:text-4xl text-[#0a0a0a] tracking-tight mt-2 mb-6">
                Keep every request connected to its context.
              </h2>
              <p className="text-[16px] text-[#525252] leading-relaxed mb-4">
                A support request is rarely just a message.
              </p>
              <p className="text-[15px] text-[#525252] leading-relaxed mb-8">
                Know who reported it, what device they're using, who is responsible for it, what has already been tried, and what happened along the way.
              </p>
              <div className="p-4 bg-[#ffffff] border border-[#e5e5e5] rounded-[10px] inline-block font-display font-semibold text-lg text-[#0a0a0a]">
                One ticket. Complete context.
              </div>
            </div>

            {/* Visual Context Stack */}
            <div className="lg:col-span-7 bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e5] mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
                  <span className="font-mono text-[13px] font-semibold text-[#0a0a0a]">SD-1002 Context Graph</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-[9999px] bg-[#f5f5f5] border border-[#e5e5e5] font-mono text-[11px] text-[#525252]">
                  CRITICAL PRIORITY
                </span>
              </div>

              <div className="space-y-3">
                {/* 1. Identity Context */}
                <div className="p-3.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#e5e5e5] flex items-center justify-center font-semibold text-xs">EW</div>
                    <div>
                      <div className="text-[13px] font-medium text-[#0a0a0a]">Emma Watson (Requester)</div>
                      <div className="text-[11px] text-[#737373]">Finance & Accounting • Level 3</div>
                    </div>
                  </div>
                  <span className="text-[12px] font-mono text-[#525252]">emp.emma@servicedesk.com</span>
                </div>

                {/* 2. Hardware Context */}
                <div className="p-3.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Laptop className="w-5 h-5 text-[#525252]" />
                    <div>
                      <div className="text-[13px] font-medium text-[#0a0a0a]">Dell XPS 15 9530 (AST-LP-002)</div>
                      <div className="text-[11px] text-[#737373]">Core i9-13900H • 32GB RAM • Windows 11</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#dcfce7] text-[#16a34a] font-medium">Warranty Valid</span>
                </div>

                {/* 3. Steps Attempted */}
                <div className="p-3.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]">
                  <div className="text-[11px] font-mono text-[#737373] uppercase mb-1">Troubleshooting History Logged</div>
                  <div className="text-[13px] text-[#171717] font-medium">
                    Attempted Safe Mode boot + DISM image check via automated guide. Crashed with CRITICAL_PROCESS_DIED.
                  </div>
                </div>

                {/* 4. Assignment */}
                <div className="p-3.5 bg-[#f5f5f5] border border-[#e5e5e5] rounded-[8px] flex items-center justify-between">
                  <div className="text-[13px] text-[#0a0a0a] font-medium">
                    Assigned: <span className="font-semibold">Rahul Sharma (Senior Tech)</span>
                  </div>
                  <div className="font-mono text-[12px] text-[#2563eb]">In Progress (20m worked)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 4: Built for the people behind IT support ───────── */}
      <section id="roles" className="py-24 border-b border-[#e5e5e5] bg-[#ffffff]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-[700px] mx-auto mb-14">
            <span className="text-[12px] font-mono uppercase tracking-[0.18em] text-[#737373]">
              Role Experiences
            </span>
            <h2 className="font-display font-medium text-3xl md:text-4xl text-[#0a0a0a] tracking-tight mt-2">
              Built for the people behind IT support.
            </h2>
          </div>

          {/* Interactive Role Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {[
              { id: 'employees', label: 'Employees', icon: Users },
              { id: 'technicians', label: 'Technicians', icon: Wrench },
              { id: 'managers', label: 'Managers', icon: UserCheck },
              { id: 'administrators', label: 'Administrators', icon: UserCog },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeRole === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveRole(tab.id)}
                  className={`px-4 py-2 text-[14px] font-medium rounded-[9999px] transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#0a0a0a] text-white shadow-sm'
                      : 'bg-[#f5f5f5] text-[#525252] hover:text-[#0a0a0a] hover:bg-[#e5e5e5]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Role Showcase Display */}
          <div className="max-w-[900px] mx-auto bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-8">
            {activeRole === 'employees' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-[8px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#0a0a0a]" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-xl text-[#0a0a0a]">Employees</h3>
                    <p className="text-[13px] text-[#737373]">Mental Model: "I need help."</p>
                  </div>
                </div>
                <p className="text-[16px] text-[#525252] leading-relaxed mb-6">
                  A simple way to get help without learning the service desk.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#525252]">
                    ✓ Conversational Self-Service
                  </div>
                  <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#525252]">
                    ✓ Zero Form Clutter
                  </div>
                  <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#525252]">
                    ✓ 1-Click Confirmation
                  </div>
                </div>
              </div>
            )}

            {activeRole === 'technicians' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-[8px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-[#0a0a0a]" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-xl text-[#0a0a0a]">Technicians</h3>
                    <p className="text-[13px] text-[#737373]">Mental Model: "What do I need to resolve?"</p>
                  </div>
                </div>
                <p className="text-[16px] text-[#525252] leading-relaxed mb-6">
                  Everything needed to investigate, communicate, and resolve issues.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#525252]">
                    ✓ Split-View Workstation
                  </div>
                  <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#525252]">
                    ✓ Embedded Work Logs
                  </div>
                  <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#525252]">
                    ✓ Internal IT Notes
                  </div>
                </div>
              </div>
            )}

            {activeRole === 'managers' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-[8px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-[#0a0a0a]" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-xl text-[#0a0a0a]">Managers</h3>
                    <p className="text-[13px] text-[#737373]">Mental Model: "Where is operations struggling?"</p>
                  </div>
                </div>
                <p className="text-[16px] text-[#525252] leading-relaxed mb-6">
                  A clear view of workload, SLAs, and support performance.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#525252]">
                    ✓ SLA Breach Alerts
                  </div>
                  <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#525252]">
                    ✓ Tech Workload Meters
                  </div>
                  <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#525252]">
                    ✓ 1-Click Tech Assign
                  </div>
                </div>
              </div>
            )}

            {activeRole === 'administrators' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-[8px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center">
                    <UserCog className="w-5 h-5 text-[#0a0a0a]" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-xl text-[#0a0a0a]">Administrators</h3>
                    <p className="text-[13px] text-[#737373]">Mental Model: "How do I configure the organization?"</p>
                  </div>
                </div>
                <p className="text-[16px] text-[#525252] leading-relaxed mb-6">
                  Control users, departments, workflows, policies, and system configuration.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#525252]">
                    ✓ User & Dept Directory
                  </div>
                  <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#525252]">
                    ✓ SLA Policy Thresholds
                  </div>
                  <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#525252]">
                    ✓ Full System Audit Logs
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Section 5: Simple for employees. Context-rich for IT. ──── */}
      <section className="py-24 border-b border-[#e5e5e5] bg-[#fafafa]">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="font-display font-medium text-3xl md:text-5xl text-[#0a0a0a] tracking-tight mb-8">
            Simple for employees. Context-rich for IT.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-[960px] mx-auto mb-10 text-left">
            <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[12px] p-6">
              <div className="font-display font-semibold text-lg text-[#0a0a0a] mb-2">Employees</div>
              <p className="text-[14px] text-[#525252] leading-relaxed">
                Employees get a simple way to ask for help.
              </p>
            </div>
            <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[12px] p-6">
              <div className="font-display font-semibold text-lg text-[#0a0a0a] mb-2">Technicians</div>
              <p className="text-[14px] text-[#525252] leading-relaxed">
                Technicians get the information they need to act.
              </p>
            </div>
            <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[12px] p-6">
              <div className="font-display font-semibold text-lg text-[#0a0a0a] mb-2">Managers</div>
              <p className="text-[14px] text-[#525252] leading-relaxed">
                Managers get visibility into workload and service performance.
              </p>
            </div>
          </div>

          <p className="font-display font-medium text-xl text-[#0a0a0a] mb-8">
            One support workflow, from first message to final resolution.
          </p>

          <button
            onClick={onNavigateToApp}
            className="px-8 py-3.5 text-[15px] font-medium text-white bg-[#0a0a0a] rounded-[8px] hover:bg-[#262626] transition-all shadow-sm inline-flex items-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ─── Footer / Final Callout ─────────────────────────────────── */}
      <footer className="py-20 bg-[#ffffff]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="bg-[#0a0a0a] rounded-[16px] p-10 md:p-14 text-white text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-[8px] bg-white text-[#0a0a0a] flex items-center justify-center font-mono font-bold text-sm mb-6">
              SD
            </div>
            <h2 className="font-display font-medium text-3xl md:text-4xl tracking-tight mb-3">
              ServiceDesk
            </h2>
            <h3 className="text-xl md:text-2xl text-[#d4d4d4] font-medium mb-4">
              Support that moves from problem to resolution.
            </h3>
            <p className="text-[#a3a3a3] text-[15px] max-w-[540px] mb-8 leading-relaxed">
              One workspace for your employees, technicians, assets, and IT operations.
            </p>
            <button
              onClick={onNavigateToApp}
              className="px-8 py-3.5 text-[15px] font-medium text-[#0a0a0a] bg-[#ffffff] rounded-[8px] hover:bg-[#f5f5f5] transition-all shadow-sm"
            >
              Get Started
            </button>
          </div>

          <div className="mt-12 pt-6 border-t border-[#e5e5e5] flex flex-col sm:flex-row items-center justify-between text-[13px] text-[#737373]">
            <div>© 2026 ServiceDesk Pro. All rights reserved.</div>
            <div className="flex gap-6 mt-4 sm:mt-0 font-mono text-[12px]">
              <span>MERN Stack</span>
              <span>REST API</span>
              <span>SLA Engine</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
