export interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  role: string;
  phone: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

export interface DailyAvailability {
  id: string;
  team_member_id: string;
  date: string; // YYYY-MM-DD
  is_available: boolean;
  start_hour: number;
  end_hour: number;
  notes: string | null;
  created_at: string;
  // Joined field
  team_member?: TeamMember;
}
