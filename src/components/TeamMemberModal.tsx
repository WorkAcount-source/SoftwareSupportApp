"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { TeamMember } from "@/types";

interface TeamMemberModalProps {
  member?: TeamMember;
  showList?: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function TeamMemberModal({
  member,
  showList = false,
  onClose,
  onSaved,
}: TeamMemberModalProps) {
  const [name, setName] = useState(member?.name || "");
  const [email, setEmail] = useState(member?.email || "");
  const [role, setRole] = useState(member?.role || "SW");
  const [phone, setPhone] = useState(member?.phone || "");
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [listMode, setListMode] = useState(showList);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (listMode) {
      fetchMembers();
    }
  }, [listMode]);

  const fetchMembers = async () => {
    const { data } = await getSupabase()
      .from("team_members")
      .select("*")
      .order("name");
    if (data) setMembers(data);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    const payload = { name: name.trim(), email: email.trim() || null, role, phone };

    if (editingMember) {
      await getSupabase()
        .from("team_members")
        .update(payload)
        .eq("id", editingMember.id);
    } else if (member?.id) {
      await getSupabase().from("team_members").update(payload).eq("id", member.id);
    } else {
      await getSupabase().from("team_members").insert(payload);
    }

    setSaving(false);
    if (listMode) {
      setEditingMember(null);
      setName("");
      setEmail("");
      setRole("SW");
      setPhone("");
      fetchMembers();
    }
    onSaved();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    await getSupabase().from("team_members").update({ is_active: false }).eq("id", id);
    fetchMembers();
    onSaved();
  };

  const startEdit = (m: TeamMember) => {
    setEditingMember(m);
    setName(m.name);
    setEmail(m.email || "");
    setRole(m.role);
    setPhone(m.phone || "");
    setListMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-[var(--card)] w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[var(--card-border)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <h2 className="text-lg font-bold">
            {listMode
              ? "Team Members"
              : editingMember
              ? "Edit Member"
              : member?.id
              ? "Edit Member"
              : "Add Team Member"}
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

        {listMode ? (
          <div className="p-4">
            {members.length === 0 ? (
              <p className="text-center text-[var(--muted)] py-8">
                No team members yet.
              </p>
            ) : (
              <div className="space-y-2">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg"
                  >
                    <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{m.name}</div>
                      <div className="text-xs text-[var(--muted)]">{m.role}</div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(m)}
                        className="text-[var(--primary)] hover:text-[var(--primary-hover)] bg-transparent p-1 text-xs"
                      >
                        Edit
                      </button>
                      {m.is_active && (
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-[var(--danger)] hover:text-red-300 bg-transparent p-1 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => {
                setListMode(false);
                setEditingMember(null);
                setName("");
                setEmail("");
                setRole("SW");
                setPhone("");
              }}
              className="w-full mt-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg py-3 font-semibold transition-colors"
            >
              + Add New Member
            </button>
          </div>
        ) : (
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
            <div className="flex gap-3 pt-2">
              {(listMode || showList) && (
                <button
                  onClick={() => {
                    setListMode(true);
                    setEditingMember(null);
                  }}
                  className="flex-1 bg-[var(--background)] text-[var(--foreground)] border border-[var(--card-border)] rounded-lg py-3 font-semibold"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg py-3 font-semibold transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
