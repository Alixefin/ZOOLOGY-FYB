

export interface Student {
  id: string; // Now a text field for manual entry
  name: string;
  nickname: string;
  best_level: string;
  worst_level: string;
  favourite_lecturer: string;
  relationship_status: string;
  alternative_career: string; // "IF NOT CSC, WHAT COURSE?"
  best_experience: string;
  worst_experience: string;
  will_miss: string;
  image_src: string | null; // Direct image URL
  // Supabase specific fields
  created_at?: string; 
  updated_at?: string;
}


export interface LogoSettings {
  associationLogo: string | null; 
  schoolLogo: string | null;
  roastBackground: string | null;
}

export interface Award {
  id: string; // uuid
  name: string;
  description: string | null;
  created_at?: string;
}

export interface AwardNomination {
  id: string; // uuid
  award_id: string;
  student_id: string;
  votes: number;
  created_at?: string;
  // Joined data from Supabase
  students?: { name: string; image_src: string | null; } | null;
}

export interface VotingSettings {
  isVotingActive: boolean;
}

export interface FYBWeekSettings {
  isFybWeekActive: boolean;
  startDate: string | null;
  scheduleDesignImage: string | null;
}

export interface FYBWeekEvent {
  id: string; // uuid
  day_index: number;
  title: string;
  description: string | null;
  created_at?: string;
}

export interface FYBWeekGalleryImage {
    id: string; // uuid
    event_id: string;
    image_url: string;
    created_at?: string;
}


export interface AppSettingsFromSupabase {
  id: number;
  logos: LogoSettings | null; 
  voting_settings: VotingSettings | null;
  fyb_week_settings: FYBWeekSettings | null;
  created_at?: string;
  updated_at?: string;
}

export interface AppState {
  students: Student[];
  logos: LogoSettings;
  votingSettings: VotingSettings;
  fybWeekSettings: FYBWeekSettings;
  fybWeekEvents: FYBWeekEvent[];
  fybWeekGallery: FYBWeekGalleryImage[];
  awards: Award[];
  nominations: AwardNomination[];
  adminPin: string; 
  isAdminLoggedIn: boolean;
}

    
