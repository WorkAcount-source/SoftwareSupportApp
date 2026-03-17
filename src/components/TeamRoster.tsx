"use client";

import { TeamMember } from "@/types";
import { FaPhone, FaWhatsapp, FaPlus, FaTimes, FaEdit } from "react-icons/fa";

interface TeamRosterProps {
  members: TeamMember[];
  isEditor?: boolean;
  onAddMember?: () => void;
  onEditMember?: (member: TeamMember) => void;
  onRemoveMember?: (id: string) => void;
}

export default function TeamRoster({ members, isEditor = false, onAddMember, onEditMember, onRemoveMember }: TeamRosterProps) {
  if (members.length === 0) return null;

  return (
    <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          Support Team
        </h2>
        {isEditor && onAddMember && (
          <button
            onClick={onAddMember}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <FaPlus size={10} />
            Add
          </button>
        )}
      </div>

      <div className="space-y-2">
        {members.map((m) => {
          const cleanPhone = (m.phone || "").replace(/\D/g, "");
          return (
            <div
              key={m.id}
              className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] px-4 py-3 flex items-center gap-3 shadow-sm hover:border-[var(--primary)]/40 transition-colors"
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm leading-tight truncate">
                  {m.name}
                </div>
                <div className="text-xs text-[var(--muted)] truncate">
                  {m.role}
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex items-center gap-1 shrink-0">
                {m.phone && (
                  <>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                      title={`Call ${m.name}`}
                    >
                      <FaPhone size={12} />
                    </a>
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/10 hover:bg-green-500/20 text-green-500 transition-colors"
                      target="_blank"
                      rel="noreferrer"
                      title={`WhatsApp ${m.name}`}
                    >
                      <FaWhatsapp size={14} />
                    </a>
                  </>
                )}
                {isEditor && onEditMember && (
                  <button
                    onClick={() => onEditMember(m)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 transition-all border border-blue-200"
                    title={`Edit ${m.name}`}
                  >
                    <FaEdit size={12} />
                  </button>
                )}
                {isEditor && onRemoveMember && (
                  <button
                    onClick={() => { if (confirm(`Remove ${m.name} from the team?`)) onRemoveMember(m.id); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-all border border-red-200"
                    title={`Remove ${m.name}`}
                  >
                    <FaTimes size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
