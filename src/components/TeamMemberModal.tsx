"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { TeamMember } from "@/types";

interface TeamMemberModalProps {
  member?: TeamMember;
  onClose: () => void;
  onSaved: () => void;
}

export default function TeamMemberModal({
  member,
  onClose,
  onSaved,
}: TeamMemberModalProps) {
  const [name, setName] = useState(member?.name || "");
  const [email, setEmail] = useState(member?.email || "");
  const [role, setRole] = useState(member?.role || "SW");
  const [phone, setPhone] = useState(member?.phone || "");
  const [isAdmin, setIsAdmin] = useState(member?.is_admin || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    const payload = { name: name.trim(), email: email.trim() || null, role, phone, is_admin: isAdmin };

    let error;
    if (member?.id) {
      ({ error } = await getSupabase().from("team_members").update(payload).eq("id", member.id));
    } else {
      ({ error } = await getSupabase().from("team_members").insert(payload));
    }

    setSaving(false);
    if (error) { alert("Failed to save. You may not have permission."); return; }
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-[var(--card)] w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[var(--card-border)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <h2 className="text-lg font-bold">
            {member?.id ? "Edit Member" : "Add Team Member"}
          </h2>
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
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@company.com"
              className="w-full"
            />
            <p className="text-[10px] text-[var(--muted)] mt-1">If this email matches a login, that user can edit the schedule.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full"
            >
              <option value="SW">SW</option>
              <option value="QA">QA</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-[var(--primary)] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span className="text-sm font-medium">Admin</span>
            <span className="text-xs text-[var(--muted)]">(can edit schedule &amp; manage team)</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg py-3 font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
