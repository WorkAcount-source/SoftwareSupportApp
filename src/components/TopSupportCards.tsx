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
    <div className="mb-8">
      <div className="flex items-start sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent leading-tight mt-1 sm:mt-0">
          On Support • {dateLabel}
        </h2>
{isEditor && (
          <button
            onClick={onAssignClick}
            className="bg-slate-800 hover:bg-slate-900 shadow-sm text-white rounded-lg px-3 py-1.5 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shrink-0"
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
              className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] px-4 py-3 flex items-center gap-3 shadow-sm group hover:border-[var(--primary)]/40 transition-colors"
            >
              {/* Name */}
              <div className="font-semibold text-sm truncate min-w-0 flex-1">
                {m?.name || "Unknown"}
              </div>

              {/* Hours */}
              <span className="text-xs text-[var(--muted)] whitespace-nowrap shrink-0 font-mono">
                {hoursLabel}
              </span>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {phone && (
                  <>
                    <a
                      href={`tel:${phone}`}
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
