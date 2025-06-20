
export interface Student {
  id: string; // Client-generated or from Supabase after insert
  name: string;
  nickname: string;
  birthday: string; // "MM/DD/YYYY"
  relationshipStatus: string;
  stateOfOrigin: string;
  lga: string;
  favouriteCourse: string;
  favouriteLecturer: string;
  favouriteCoursemates: string[];
  hobbies: string[];
  postsHeld: string;
  bestLevel: string;
  worstLevel: string;
  classRepQuote: string;
  partingWords: string;
  imageSrc: string | null; // URL from Supabase Storage or data URI for new upload
  flyerImageSrc: string | null; // URL from Supabase Storage or data URI for new upload
  // Supabase specific fields, if you select them
  created_at?: string; 
  updated_at?: string;
}

export interface LogoSettings {
  associationLogo: string | null; // URL from Supabase Storage or data URI for new upload
  schoolLogo: string | null; // URL from Supabase Storage or data URI for new upload
}

export interface FYBEventImage {
  id: string; // client-generated or from DB
  src: string | null; // URL from Supabase Storage or data URI for new upload // Changed from 'url' to 'src'
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
  logos: LogoSettings | null; // This will store URLs after upload
  fyb_week_settings: FYBWeekSettings | null;
  admin_pin_hash?: string | null; // Optional, as we're not using it yet
  created_at?: string;
  updated_at?: string;
}

export interface AppState {
  students: Student[];
  logos: LogoSettings;
  fybWeekSettings: FYBWeekSettings;
  adminPin: string; // Kept client-side for now
  isAdminLoggedIn: boolean;
}
