
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Student, LogoSettings, FYBWeekSettings, AppState, FYBEventImage, AppSettingsFromSupabase } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for images/students if needed

// Helper to convert Data URI to Blob for Supabase upload
function dataURIToBlob(dataURI: string): Blob | null {
  try {
    const splitDataURI = dataURI.split(',');
    if (splitDataURI.length < 2) throw new Error("Invalid data URI");
    const byteString = splitDataURI[0].includes('base64') ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(':')[1]?.split(';')[0];
    if (!mimeString) throw new Error("MIME type not found in data URI");
    
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new Blob([ia], { type: mimeString });
  } catch (error) {
    console.error("Error converting data URI to Blob:", error);
    return null;
  }
}

const defaultLogos: LogoSettings = {
  associationLogo: null,
  schoolLogo: null,
};

const defaultFYBWeekSettings: FYBWeekSettings = {
  isUnlocked: false,
  title: 'FYB Week Extravaganza!',
  schedule: 'Detailed schedule coming soon...',
  activities: 'Exciting activities lineup to be announced!',
  eventImages: [],
};

const defaultAdminPin = "171225"; // Keep client-side for UI lock, not for DB auth

const APP_SETTINGS_ID = 1; // Singleton row ID for app_settings table
const STORAGE_BUCKET_NAME = 'app-public-assets';


interface AppContextType extends AppState {
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>; // Keep for local state updates after DB ops
  
  updateLogo: (logoType: 'associationLogo' | 'schoolLogo', fileDataUrl: string | null) => Promise<void>;
  updateFybWeekTextSettings: (settings: Partial<Pick<FYBWeekSettings, 'title' | 'schedule' | 'activities' | 'isUnlocked'>>) => Promise<void>;

  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  
  addStudent: (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateStudent: (studentData: Student) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  
  addFybEventImage: (file: File) => Promise<void>;
  deleteFybEventImage: (imageId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [logos, setLogosState] = useState<LogoSettings>(defaultLogos);
  const [fybWeekSettings, setFybWeekSettingsState] = useState<FYBWeekSettings>(defaultFYBWeekSettings);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        if (!supabase) {
          throw new Error("Supabase client is not initialized. Check your environment variables and supabaseClient.ts.");
        }

        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .order('name', { ascending: true });
        if (studentsError) throw studentsError;
        setStudents(studentsData || []);

        // Fetch app_settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('app_settings')
          .select('logos, fyb_week_settings')
          .eq('id', APP_SETTINGS_ID)
          .single();
        
        if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116: single row not found
             throw settingsError;
        }

        if (settingsData) {
          setLogosState(settingsData.logos || defaultLogos);
          setFybWeekSettingsState(settingsData.fyb_week_settings || defaultFYBWeekSettings);
        } else {
          console.warn("No app_settings found in database (ID: ", APP_SETTINGS_ID, "). Using client-side defaults. Consider seeding this table.");
          setLogosState(defaultLogos);
          setFybWeekSettingsState(defaultFYBWeekSettings);
        }
        
      } catch (error: any) {
        
        let isFailedToFetch = false;
        let extractedErrorMessage = "Unknown error during data load.";

        if (error && typeof error === 'object') {
          if ('message' in error && typeof error.message === 'string' && (error.message.toLowerCase().includes("failed to fetch") || error.message.toLowerCase().includes("typeerror: failed to fetch"))) {
            isFailedToFetch = true;
            extractedErrorMessage = error.message;
          }
           if (!isFailedToFetch && 'details' in error && typeof error.details === 'string' && (error.details.toLowerCase().includes("failed to fetch") || error.details.toLowerCase().includes("typeerror: failed to fetch"))) {
            isFailedToFetch = true;
            extractedErrorMessage = error.details;
          }
        } else if (typeof error === 'string' && (error.toLowerCase().includes("failed to fetch") || error.toLowerCase().includes("typeerror: failed to fetch"))) {
          isFailedToFetch = true;
          extractedErrorMessage = error;
        }

        if (isFailedToFetch) {
            const troubleshootingMessage = `
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!! CRITICAL CONNECTION ERROR: 'Failed to fetch'                             !!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
This means your application could NOT connect to the Supabase server.
The error message received was: "${extractedErrorMessage}"

Please meticulously verify the following troubleshooting steps:
1.  \`.env.local\` File: Ensure this file exists in your project root.
    - Check for typos in the filename: \`.env.local\` (NOT \`.env\` or \`.env.development\`).
2.  Supabase URL: In \`.env.local\`, \`NEXT_PUBLIC_SUPABASE_URL\` must be exactly \`https://iwkslfapaxafwghfhefu.supabase.co\`
    - Verify no extra spaces or characters.
3.  Supabase Anon Key: In \`.env.local\`, \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` must be your correct public anonymous key from the Supabase dashboard (API settings).
    - Your key starts with: \`eyJhbGciOi...\`
    - Verify it's copied completely and accurately.
4.  Restart Server: After any changes to \`.env.local\`, YOU MUST RESTART your Next.js development server (e.g., stop and run \`npm run dev\` again).
5.  Internet Connection: Verify your computer has a stable internet connection.
6.  Firewalls/VPNs/Proxies/Ad-Blockers: Ensure no firewall, VPN, proxy, or ad-blocker (including browser extensions) is interfering with requests to \`*.supabase.co\` domains.
    - Try temporarily disabling them to test.
7.  Supabase Project Status: Check your Supabase project dashboard (status.supabase.com) to ensure it's active and healthy.
8.  Console Network Tab: Open your browser's developer tools (F12), go to the 'Network' tab, and refresh the page. Look for failed requests to \`iwkslfapaxafwghfhefu.supabase.co\`. The status and response can provide more clues.
`;
            console.error(troubleshootingMessage);
        } else {
            console.error('An unexpected error occurred while loading initial data from Supabase:', error);
        }
        
        // Fallback to defaults
        setStudents([]);
        setLogosState(defaultLogos);
        setFybWeekSettingsState(defaultFYBWeekSettings);
      } finally {
        setIsLoading(false);
      }
      
      const storedAdminLogin = localStorage.getItem('nazsAdminLoggedIn');
      if (storedAdminLogin === 'true') {
        setIsAdminLoggedIn(true);
      }
    }
    loadInitialData();
  }, []);
  
  useEffect(() => {
    localStorage.setItem('nazsAdminLoggedIn', isAdminLoggedIn.toString());
  }, [isAdminLoggedIn]);

  const loginAdmin = (pin: string) => {
    if (pin === defaultAdminPin) {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
  };

  const uploadFileToSupabase = async (fileBlob: Blob, pathPrefix: string, fileNameWithoutExt: string): Promise<string | null> => {
    if (!supabase) {
      console.error("Supabase client not available for file upload.");
      return null;
    }
    const fileExt = fileBlob.type.split('/')[1] || 'png';
    const fullFileName = `${fileNameWithoutExt}.${fileExt}`;
    const filePath = `${pathPrefix}/${Date.now()}_${fullFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET_NAME)
      .upload(filePath, fileBlob, { upsert: true }); 

    if (uploadError) {
      console.error(`Error uploading ${fullFileName}:`, uploadError);
      throw uploadError;
    }
    const { data } = supabase.storage.from(STORAGE_BUCKET_NAME).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const deleteFileFromSupabase = async (fileUrl: string | null): Promise<void> => {
    if (!fileUrl || !supabase) return;
    try {
      const url = new URL(fileUrl);
      const pathSegments = url.pathname.split('/');
      const bucketNameIndex = pathSegments.findIndex(segment => segment === STORAGE_BUCKET_NAME);
      if (bucketNameIndex === -1 || bucketNameIndex + 1 >= pathSegments.length) {
        console.error("Could not determine file path from URL for deletion:", fileUrl);
        return;
      }
      const filePath = pathSegments.slice(bucketNameIndex + 1).join('/');
      
      const { error } = await supabase.storage.from(STORAGE_BUCKET_NAME).remove([filePath]);
      if (error) console.error(`Error deleting file ${filePath}:`, error);
    } catch (e) {
      console.error("Error parsing or deleting file URL:", fileUrl, e);
    }
  };

  const updateLogo = async (logoType: 'associationLogo' | 'schoolLogo', fileDataUrl: string | null) => {
    if (!supabase) throw new Error("Supabase client not available for updating logo.");
    
    let newLogoUrl: string | null = null;
    const currentLogoUrl = logos[logoType];

    if (fileDataUrl) { 
      const blob = dataURIToBlob(fileDataUrl);
      if (blob) {
        if (currentLogoUrl) await deleteFileFromSupabase(currentLogoUrl); 
        newLogoUrl = await uploadFileToSupabase(blob, 'logos', logoType);
      }
    } else if (currentLogoUrl) { 
      await deleteFileFromSupabase(currentLogoUrl);
    }

    const updatedLogos = { ...logos, [logoType]: newLogoUrl };
    const { error } = await supabase
      .from('app_settings')
      .update({ logos: updatedLogos })
      .eq('id', APP_SETTINGS_ID);

    if (error) {
      console.error('Error updating logos in DB:', error);
      throw error;
    }
    setLogosState(updatedLogos);
  };
  
  const updateFybWeekTextSettings = async (settings: Partial<Pick<FYBWeekSettings, 'title' | 'schedule' | 'activities' | 'isUnlocked'>>) => {
    if (!supabase) throw new Error("Supabase client not available for updating FYB week settings.");

    const updatedSettings = { ...fybWeekSettings, ...settings };
    const { error } = await supabase
      .from('app_settings')
      .update({ fyb_week_settings: updatedSettings })
      .eq('id', APP_SETTINGS_ID);
    
    if (error) {
      console.error('Error updating FYB Week text settings:', error);
      throw error;
    }
    setFybWeekSettingsState(updatedSettings);
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    if (!supabase) throw new Error("Supabase client not available for adding student.");
    
    let profileImageUrl: string | null = studentData.imageSrc; 
    if (studentData.imageSrc && studentData.imageSrc.startsWith('data:')) {
      const blob = dataURIToBlob(studentData.imageSrc);
      profileImageUrl = blob ? await uploadFileToSupabase(blob, 'student_profiles', `profile_${uuidv4()}`) : null;
    }

    let flyerImageUrl: string | null = studentData.flyerImageSrc;
    if (studentData.flyerImageSrc && studentData.flyerImageSrc.startsWith('data:')) {
      const blob = dataURIToBlob(studentData.flyerImageSrc);
      flyerImageUrl = blob ? await uploadFileToSupabase(blob, 'student_flyers', `flyer_${uuidv4()}`) : null;
    }

    const studentToInsert = {
      ...studentData,
      id: uuidv4(), 
      imageSrc: profileImageUrl,
      flyerImageSrc: flyerImageUrl,
    };

    const { data: newStudent, error } = await supabase
      .from('students')
      .insert(studentToInsert)
      .select()
      .single();

    if (error) {
      console.error('Error adding student:', error);
      throw error;
    }
    if (newStudent) setStudents(prev => [...prev, newStudent].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const updateStudent = async (studentData: Student) => {
    if (!supabase) throw new Error("Supabase client not available for updating student.");

    const originalStudent = students.find(s => s.id === studentData.id);
    if (!originalStudent) {
      throw new Error("Student not found for update");
    }

    let profileImageUrl: string | null = studentData.imageSrc;
    if (studentData.imageSrc && studentData.imageSrc.startsWith('data:')) { 
      if (originalStudent.imageSrc) await deleteFileFromSupabase(originalStudent.imageSrc);
      const blob = dataURIToBlob(studentData.imageSrc);
      profileImageUrl = blob ? await uploadFileToSupabase(blob, 'student_profiles', `profile_${studentData.id}_${Date.now()}`) : null;
    } else if (studentData.imageSrc === null && originalStudent.imageSrc) { 
        await deleteFileFromSupabase(originalStudent.imageSrc);
    }


    let flyerImageUrl: string | null = studentData.flyerImageSrc;
    if (studentData.flyerImageSrc && studentData.flyerImageSrc.startsWith('data:')) { 
      if (originalStudent.flyerImageSrc) await deleteFileFromSupabase(originalStudent.flyerImageSrc);
      const blob = dataURIToBlob(studentData.flyerImageSrc);
      flyerImageUrl = blob ? await uploadFileToSupabase(blob, 'student_flyers', `flyer_${studentData.id}_${Date.now()}`) : null;
    } else if (studentData.flyerImageSrc === null && originalStudent.flyerImageSrc) { 
        await deleteFileFromSupabase(originalStudent.flyerImageSrc);
    }
    
    const studentToUpdatePayload = {
      ...studentData,
      imageSrc: profileImageUrl,
      flyerImageSrc: flyerImageUrl,
    };
   
    const { id, created_at, updated_at, ...updatePayload } = studentToUpdatePayload;


    const { data: updatedStudent, error } = await supabase
      .from('students')
      .update(updatePayload)
      .eq('id', studentData.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating student:', error);
      throw error;
    }
    if (updatedStudent) setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s).sort((a,b) => a.name.localeCompare(b.name)));
  };

  const deleteStudent = async (studentId: string) => {
    if (!supabase) throw new Error("Supabase client not available for deleting student.");
    
    const studentToDelete = students.find(s => s.id === studentId);
    if (studentToDelete) {
      if (studentToDelete.imageSrc) await deleteFileFromSupabase(studentToDelete.imageSrc);
      if (studentToDelete.flyerImageSrc) await deleteFileFromSupabase(studentToDelete.flyerImageSrc);
    }

    const { error } = await supabase.from('students').delete().eq('id', studentId);
    if (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };
  
  const addFybEventImage = async (file: File) => {
     if (!supabase) throw new Error("Supabase client not available for adding FYB event image.");
    
    const imageId = uuidv4();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const imageUrl = await uploadFileToSupabase(file, 'fyb_event_images', `${imageId}_${safeFileName}`);

    if (!imageUrl) throw new Error("File upload failed, received no public URL.");

    const newImage: FYBEventImage = { id: imageId, src: imageUrl, name: file.name }; 
    const updatedImages = [...fybWeekSettings.eventImages, newImage];
    const updatedSettings = { ...fybWeekSettings, eventImages: updatedImages };
    
    const { error } = await supabase
      .from('app_settings')
      .update({ fyb_week_settings: updatedSettings })
      .eq('id', APP_SETTINGS_ID);

    if (error) {
      console.error('Error adding FYB event image:', error);
      throw error;
    }
    setFybWeekSettingsState(updatedSettings);
  };

  const deleteFybEventImage = async (imageId: string) => {
    if (!supabase) throw new Error("Supabase client not available for deleting FYB event image.");

    const imageToDelete = fybWeekSettings.eventImages.find(img => img.id === imageId);
    if (imageToDelete?.src) { 
      await deleteFileFromSupabase(imageToDelete.src);
    }
    
    const updatedImages = fybWeekSettings.eventImages.filter(img => img.id !== imageId);
    const updatedSettings = { ...fybWeekSettings, eventImages: updatedImages };

    const { error } = await supabase
      .from('app_settings')
      .update({ fyb_week_settings: updatedSettings })
      .eq('id', APP_SETTINGS_ID);

    if (error) {
      console.error('Error deleting FYB event image:', error);
      throw error;
    }
    setFybWeekSettingsState(updatedSettings);
  };


  return (
    <AppContext.Provider value={{
      students, setStudents, 
      logos, 
      fybWeekSettings, 
      adminPin: defaultAdminPin,
      isAdminLoggedIn, 
      loginAdmin, logoutAdmin,
      addStudent, updateStudent, deleteStudent,
      updateLogo, updateFybWeekTextSettings,
      addFybEventImage, deleteFybEventImage
    }}>
      {isLoading ? <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-background"><div className="animate-pulse text-primary font-headline text-lg">Loading Application Data...</div></div> : children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
