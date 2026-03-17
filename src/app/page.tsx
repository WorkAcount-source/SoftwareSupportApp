"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabase } from "@/lib/supabase";
import { getCalendarRange } from "@/lib/calendar";
import { TeamMember, DailyAvailability } from "@/types";
import { format, addMonths, subMonths, isToday } from "date-fns";
import Header from "@/components/Header";
import TopSupportCards from "@/components/TopSupportCards";
import CalendarGrid from "@/components/CalendarGrid";
import TeamMemberModal from "@/components/TeamMemberModal";
import AssignModal from "@/components/AssignModal";
import LoginModal from "@/components/LoginModal";
import TeamRoster from "@/components/TeamRoster";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [availability, setAvailability] = useState<DailyAvailability[]>([]);
  
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showAssign, setShowAssign] = useState(false);

  const { requireAdmin, showLoginModal, role } = useAuth();

  const fetchTeamMembers = useCallback(async () => {
    const { data } = await getSupabase()
      .from("team_members")
      .select("*")
      .eq("is_active", true)
      .order("name");
    if (data) setTeamMembers(data);
  }, []);

  const fetchMonthAvailability = useCallback(async () => {
    const { startDate, endDate } = getCalendarRange(currentMonth);
    const startStr = format(startDate, "yyyy-MM-dd");
    const endStr = format(endDate, "yyyy-MM-dd");

    const { data } = await getSupabase()
      .from("daily_availability")
      .select("*, team_member:team_members(*)")
      .gte("date", startStr)
      .lte("date", endStr)
      .eq("is_available", true);
      
    if (data) setAvailability(data);
  }, [currentMonth]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  useEffect(() => {
    fetchMonthAvailability();
  }, [fetchMonthAvailability]);

  // Derived state for the currently selected day's availability
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDayAvailabilities = useMemo(() => {
    return availability.filter((a) => a.date === selectedDateStr);
  }, [availability, selectedDateStr]);

  const handlePrevMonth = () => setCurrentMonth((d) => subMonths(d, 1));
  const handleNextMonth = () => setCurrentMonth((d) => addMonths(d, 1));
  
  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    // If selecting a date outside current month, automatically change month
    if (format(date, "MM") !== format(currentMonth, "MM")) {
      setCurrentMonth(date);
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  };

  const handleRemoveAvailability = async (id: string) => {
    if (!requireAdmin()) return;
    const { error } = await getSupabase().from("daily_availability").delete().eq("id", id);
    if (error) { alert("Failed to remove assignment. You may not have permission."); return; }
    fetchMonthAvailability();
  };

  const handleMemberSaved = () => {
    setShowAddMember(false);
    setEditingMember(null);
    fetchTeamMembers();
  };

  const handleRemoveMember = async (id: string) => {
    if (!requireAdmin()) return;
    const { error } = await getSupabase().from("team_members").update({ is_active: false }).eq("id", id);
    if (error) { alert("Failed to remove member. You may not have permission."); return; }
    fetchTeamMembers();
    fetchMonthAvailability();
  };

  const handleAssigned = () => {
    setShowAssign(false);
    fetchMonthAvailability();
  };

  const displayDateLabel = isToday(selectedDate)
    ? "Today"
    : format(selectedDate, "MMM d, yyyy");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Selected Day Focus (Cards) */}
        <div className="lg:w-[400px] shrink-0">
          <TopSupportCards
            availabilities={selectedDayAvailabilities}
            dateLabel={displayDateLabel}
            onRemove={handleRemoveAvailability}
            onAssignClick={() => { if (requireAdmin()) setShowAssign(true); }}
            isEditor={role.isAdmin}
          />

          <div className="hidden lg:block">
            <TeamRoster
              members={teamMembers}
              isEditor={role.isAdmin}
              onAddMember={() => { if (requireAdmin()) setShowAddMember(true); }}
              onEditMember={(m) => { if (requireAdmin()) setEditingMember(m); }}
              onRemoveMember={handleRemoveMember}
            />
          </div>
        </div>

        {/* Right Side: Calendar View */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleGoToToday}
                className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] px-2 transition-colors"
              >
                Today
              </button>
              
              <div className="flex gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-sm flex items-center justify-center transition-all"
                >
                  <FaChevronLeft size={14} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-sm flex items-center justify-center transition-all"
                >
                  <FaChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <CalendarGrid
            currentDate={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            availabilities={availability}
          />
          
          {/* Mobile view only: Roster below calendar */}
          <div className="mt-8 block lg:hidden">
            <TeamRoster
              members={teamMembers}
              isEditor={role.isAdmin}
              onAddMember={() => { if (requireAdmin()) setShowAddMember(true); }}
              onEditMember={(m) => { if (requireAdmin()) setEditingMember(m); }}
              onRemoveMember={handleRemoveMember}
            />
          </div>
        </div>
      </main>

      {(showAddMember || editingMember) && (
        <TeamMemberModal
          member={editingMember || undefined}
          onClose={() => { setShowAddMember(false); setEditingMember(null); }}
          onSaved={handleMemberSaved}
        />
      )}

      {showAssign && (
        <AssignModal
          date={selectedDateStr}
          teamMembers={teamMembers}
          existingAvailability={selectedDayAvailabilities}
          onClose={() => setShowAssign(false)}
          onAssigned={handleAssigned}
        />
      )}

      {showLoginModal && <LoginModal />}

      {/* Footer */}
      <footer className="border-t border-[var(--card-border)] bg-[var(--card)] py-4 mt-auto">
        <div className="flex items-center justify-center gap-2">
          <img src="/logo-full.png" alt="Rigaku" className="h-[16px] object-contain opacity-70" />
          <span className="text-xs text-[var(--muted)]">Powered by Rigaku Software Team</span>
        </div>
      </footer>
    </div>
  );
}
