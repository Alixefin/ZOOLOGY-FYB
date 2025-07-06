
export interface Student {
  id: string; // User-provided ID
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
}

export interface FYBEventImage {
  id: string; 
  src: string;
  name: string;
}

export interface FYBWeekSettings {
  isUnlocked: boolean;
  title: string;
  schedule: string;
  activities: string;
  eventImages: FYBEventImage[];
}

export interface AppSettingsFromSupabase {
  id: number;
  logos: LogoSettings | null; 
  fyb_week_settings: FYBWeekSettings | null;
  admin_pin_hash?: string | null; 
  created_at?: string;
  updated_at?: string;
}

export interface AppState {
  students: Student[];
  logos: LogoSettings;
  fybWeekSettings: FYBWeekSettings;
  adminPin: string; 
  isAdminLoggedIn: boolean;
}
