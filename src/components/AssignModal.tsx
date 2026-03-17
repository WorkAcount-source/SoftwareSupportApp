"use client";

import { useState, useMemo } from "react";
import { getSupabase } from "@/lib/supabase";
import { TeamMember, DailyAvailability } from "@/types";
import { format, addWeeks, getDay } from "date-fns";

interface AssignModalProps {
  date: string;
  teamMembers: TeamMember[];
  existingAvailability: DailyAvailability[];
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignModal({
  date,
  teamMembers,
  existingAvailability,
  onClose,
  onAssigned,
}: AssignModalProps) {
  const assignedIds = new Set(
    existingAvailability.map((a) => a.team_member_id)
  );
  const availableMembers = teamMembers.filter((m) => !assignedIds.has(m.id));

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(17);
  const [notes, setNotes] = useState("");
  const [repeatWeeks, setRepeatWeeks] = useState(0);
  const [saving, setSaving] = useState(false);

  const dayOfWeekName = useMemo(() => {
    const d = new Date(date + "T00:00:00");
    return format(d, "EEEE");
  }, [date]);

  const repeatDates = useMemo(() => {
    const baseDate = new Date(date + "T00:00:00");
    const dates = [date];
    for (let w = 1; w <= repeatWeeks; w++) {
      dates.push(format(addWeeks(baseDate, w), "yyyy-MM-dd"));
    }
    return dates;
  }, [date, repeatWeeks]);

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAssign = async () => {
    if (selectedIds.size === 0) return;
    setSaving(true);

    const rows = Array.from(selectedIds).flatMap((team_member_id) =>
      repeatDates.map((d) => ({
        team_member_id,
        date: d,
        is_available: true,
        start_hour: startHour,
        end_hour: endHour,
        notes: notes.trim() || null,
      }))
    );

    await getSupabase().from("daily_availability").insert(rows);
    setSaving(false);
    onAssigned();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-[var(--card)] w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[var(--card-border)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <h2 className="text-lg font-bold">Assign Support</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)] bg-transparent transition-colors"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Hours selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Available Hours</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-[var(--muted)] mb-1">From</label>
                <select
                  value={startHour}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStartHour(val);
                    if (val >= endHour) setEndHour(Math.min(val + 1, 23));
                  }}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] px-3 py-2 text-sm"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
              <span className="text-[var(--muted)] mt-5">–</span>
              <div className="flex-1">
                <label className="block text-xs text-[var(--muted)] mb-1">To</label>
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] px-3 py-2 text-sm"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i} disabled={i <= startHour}>{String(i).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Remote, On-site..."
              className="w-full"
            />
          </div>

          {/* Repeat */}
          <div>
            <label className="block text-sm font-medium mb-2">Repeat</label>
            <select
              value={repeatWeeks}
              onChange={(e) => setRepeatWeeks(Number(e.target.value))}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] px-3 py-2 text-sm"
            >
              <option value={0}>This day only</option>
              <option value={1}>Every {dayOfWeekName} for 2 weeks</option>
              <option value={3}>Every {dayOfWeekName} for 4 weeks</option>
              <option value={7}>Every {dayOfWeekName} for 8 weeks</option>
              <option value={11}>Every {dayOfWeekName} for 12 weeks</option>
            </select>
            {repeatWeeks > 0 && (
              <p className="text-[10px] text-[var(--muted)] mt-1">
                Will assign to {repeatDates.length} {dayOfWeekName}s: {repeatDates[0]} → {repeatDates[repeatDates.length - 1]}
              </p>
            )}
          </div>

          {/* Member selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Members ({selectedIds.size} selected)
            </label>

            {availableMembers.length === 0 ? (
              <p className="text-center text-[var(--muted)] py-6 text-sm">
                All team members are already assigned for this day.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleMember(m.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors border text-left ${
                      selectedIds.has(m.id)
                        ? "bg-[var(--primary)]/10 border-[var(--primary)]"
                        : "bg-[var(--background)] border-[var(--card-border)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        selectedIds.has(m.id)
                          ? "bg-[var(--primary)] border-[var(--primary)]"
                          : "border-[var(--card-border)]"
                      }`}
                    >
                      {selectedIds.has(m.id) && (
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{m.name}</div>
                      <div className="text-xs text-[var(--muted)]">{m.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleAssign}
            disabled={saving || selectedIds.size === 0}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg py-3 font-semibold transition-colors disabled:opacity-50"
          >
            {saving
              ? "Assigning..."
              : `Assign ${selectedIds.size} Member${selectedIds.size !== 1 ? "s" : ""}${repeatWeeks > 0 ? ` × ${repeatDates.length} weeks` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
