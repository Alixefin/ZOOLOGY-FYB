
export interface Student {
  id: string; 
  name: string;
  nickname: string;
  birthday: string; 
  relationship_status: string;
  state_of_origin: string;
  lga: string;
  favourite_course: string;
  favourite_lecturer: string;
  favourite_coursemates: string[];
  hobbies: string[];
  posts_held: string;
  best_level: string;
  worst_level: string;
  class_rep_quote: string;
  parting_words: string;
  alternative_career: string;
  image_src: string | null; 
  flyer_image_src: string | null; 
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
