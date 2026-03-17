"use client";

import { DailyAvailability } from "@/types";
import { FaPhone, FaWhatsapp, FaCog, FaTimes } from "react-icons/fa";

interface TopSupportCardsProps {
  availabilities: DailyAvailability[];
  dateLabel: string;
  onRemove: (id: string) => void;
  onAssignClick: () => void;
  isEditor?: boolean;
}

export default function TopSupportCards({
  availabilities,
  dateLabel,
  onRemove,
  onAssignClick,
  isEditor = false
}: TopSupportCardsProps) {
  
  if (availabilities.length === 0) {
    return (
      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-6 text-center shadow-lg mb-6">
        <div className="text-3xl mb-3">📭</div>
        <h3 className="text-lg font-semibold mb-1">No support assigned for {dateLabel}</h3>
        <p className="text-sm text-[var(--muted)] mb-4">
          {isEditor ? "Click below to assign team members." : "No one is assigned yet."}
        </p>
        {isEditor && (
          <button
            onClick={onAssignClick}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg px-6 py-2 text-sm font-semibold transition-colors"
          >
            + Assign Support
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-2xl border-2 border-[var(--primary)] bg-slate-50 dark:bg-slate-800/80 p-4 shadow-lg">
      <div className="flex items-start sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-bold leading-tight mt-1 sm:mt-0 bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent">
          On Support • {dateLabel}
        </h2>
{isEditor && (
          <button
            onClick={onAssignClick}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] shadow-sm text-white rounded-lg px-3 py-1.5 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shrink-0"
          >
            <FaCog size={12} />
            Manage
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {availabilities.map((item) => {
          const m = item.team_member;
          const phone = m?.phone || "";
          const cleanPhone = phone.replace(/\D/g, "");
          const hoursLabel = `${String(item.start_hour).padStart(2, '0')}:00 – ${String(item.end_hour).padStart(2, '0')}:00`;
          
          return (
            <div
              key={item.id}
              className="rounded-xl border bg-slate-100/80 dark:bg-slate-700/40 border-[var(--primary)]/30 px-4 py-4 flex items-center gap-3 group transition-colors shadow-md hover:border-[var(--primary)]/60"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-[var(--primary-bg)] text-[var(--primary)] border border-[var(--primary)]/20 flex items-center justify-center text-sm font-bold shrink-0">
                {m?.name?.charAt(0).toUpperCase() || '?'}
              </div>

              {/* Name */}
              <div className="truncate min-w-0 flex-1 font-bold text-sm">
                {m?.name || "Unknown"}
              </div>

              {/* Hours */}
              <span className="whitespace-nowrap shrink-0 font-mono text-xs text-[var(--primary)] font-semibold">
                {hoursLabel}
              </span>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {phone && (
                  <>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                      title={`Call ${m?.name}`}
                    >
                      <FaPhone size={12} />
                    </a>
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/10 hover:bg-green-500/20 text-green-500 transition-colors"
                      target="_blank"
                      rel="noreferrer"
                      title={`WhatsApp ${m?.name}`}
                    >
                      <FaWhatsapp size={14} />
                    </a>
                  </>
                )}

                {/* Remove button */}
                {isEditor && (
                  <button
                    onClick={() => onRemove(item.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-all border border-red-200"
                    title="Remove from shift"
                  >
                    <FaTimes size={14} />
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
