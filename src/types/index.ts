
export interface Student {
  id: string;
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
  imageSrc: string | null; // Data URL for uploaded image
  flyerImageSrc: string | null; // Data URL for uploaded flyer
}

export interface LogoSettings {
  associationLogo: string | null; // Data URL for association logo
  schoolLogo: string | null; // Data URL for school logo
}

export interface FYBWeekSettings {
  isUnlocked: boolean;
  title: string;
  schedule: string; // Could be markdown or rich text
  activities: string; // Could be markdown or rich text
  eventImages: { id: string; src: string; name: string }[]; // Data URLs for event images
}

export interface AppState {
  students: Student[];
  logos: LogoSettings;
  fybWeekSettings: FYBWeekSettings;
  adminPin: string;
  isAdminLoggedIn: boolean;
}
