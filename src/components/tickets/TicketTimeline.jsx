import React from 'react';
import { Check, Clock, AlertCircle, CheckCircle2, UserCheck, Wrench } from 'lucide-react';

export default function TicketTimeline({ ticket }) {
  if (!ticket) return null;

  const steps = [
    {
      id: 'OPEN',
      label: 'Ticket Created',
      desc: `Submitted by ${ticket.requester?.name || 'Requester'}`,
      date: ticket.createdAt,
      completed: true,
      active: ticket.status === 'OPEN',
    },
    {
      id: 'ASSIGNED',
      label: 'Technician Assigned',
      desc: ticket.assignee ? `Assigned to ${ticket.assignee.name}` : 'Awaiting Assignment',
      date: ticket.status !== 'OPEN' ? ticket.updatedAt : null,
      completed: ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(ticket.status),
      active: ticket.status === 'ASSIGNED',
    },
    {
      id: 'IN_PROGRESS',
      label: 'Work In Progress',
      desc: ticket.firstResponseAt ? 'Technician investigating' : 'Work pending',
      date: ticket.firstResponseAt || null,
      completed: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(ticket.status),
      active: ticket.status === 'IN_PROGRESS' || ticket.status === 'REOPENED',
    },
    {
      id: 'RESOLVED',
      label: 'Resolution Proposed',
      desc: ticket.resolvedAt ? 'Awaiting employee confirmation' : 'Pending resolution',
      date: ticket.resolvedAt || null,
      completed: ['RESOLVED', 'CLOSED'].includes(ticket.status),
      active: ticket.status === 'RESOLVED',
    },
    {
      id: 'CLOSED',
      label: 'Confirmed & Closed',
      desc: ticket.closedAt ? 'Resolution confirmed' : 'Pending final closure',
      date: ticket.closedAt || null,
      completed: ticket.status === 'CLOSED',
      active: ticket.status === 'CLOSED',
    },
  ];

  return (
    <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="text-[12px] font-mono uppercase tracking-wider text-[#737373] mb-4">
        Ticket Lifecycle Timeline
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#e5e5e5]">
        {steps.map((step, idx) => (
          <div key={step.id} className="relative flex items-start gap-3.5">
            {/* Step Icon Indicator */}
            <div
              className={`absolute -left-[24px] top-0.5 w-[22px] h-[22px] rounded-full flex items-center justify-center font-mono text-[10px] transition-all ${
                step.completed
                  ? 'bg-[#0a0a0a] text-white'
                  : step.active
                  ? 'bg-[#2563eb] text-white ring-4 ring-[#2563eb]/20'
                  : 'bg-[#ffffff] border-2 border-[#e5e5e5] text-[#a3a3a3]'
              }`}
            >
              {step.completed ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : (
                <span>{idx + 1}</span>
              )}
            </div>

            {/* Step Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[13px] font-medium ${step.active ? 'text-[#2563eb]' : step.completed ? 'text-[#0a0a0a]' : 'text-[#737373]'}`}>
                  {step.label}
                </span>
                {step.date && (
                  <span className="text-[11px] font-mono text-[#737373] flex-shrink-0">
                    {new Date(step.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                    {new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[#737373] mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
