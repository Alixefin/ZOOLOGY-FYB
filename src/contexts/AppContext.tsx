
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
          setLogosState(defaultLogos);
          setFybWeekSettingsState(defaultFYBWeekSettings);
        }

      } catch (error: any) {
        console.error('--- Error During Initial Data Load ---');
        let errorIsObject = false;
        if (error && typeof error === 'object') {
            errorIsObject = true;
            if (error.message === "TypeError: Failed to fetch" || (typeof error.message === 'string' && error.message.includes("Failed to fetch"))) {
                console.error("Critical Error: 'Failed to fetch'. This usually means the application could not connect to the Supabase server.");
                console.error("Please verify the following:");
                console.error("1. Your `NEXT_PUBLIC_SUPABASE_URL` in `.env.local` is correct (should be: https://iwkslfapaxafwghfhefu.supabase.co).");
                console.error("2. Your `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` is correct.");
                console.error("3. You have restarted your Next.js development server after any changes to `.env.local`.");
                console.error("4. Your internet connection is active and stable.");
                console.error("5. No firewalls, proxies, or VPNs are blocking requests to Supabase.");
                console.error("6. Your Supabase project is active and accessible via its URL.");
            }
            if ('message' in error) console.error('Error Message:', error.message);
            if ('details' in error) console.error('Error Details:', error.details);
            if ('hint' in error) console.error('Error Hint:', error.hint);
            if ('code' in error) console.error('Error Code:', error.code);
            
            // Attempt to stringify for more details if it's an object
            try {
                const fullErrorString = JSON.stringify(error, Object.getOwnPropertyNames(error));
                console.error('Full Error Object (stringified):', fullErrorString);
            } catch (e) {
                console.error('Could not stringify the full error object.');
            }
        }
        
        if (!errorIsObject) {
            console.error('Raw Error (not a typical object or failed to process):', error);
        }
        console.error('--- End of Error Report ---');
        
        // Fallback to defaults on error
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
      return null;
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
    if (!supabase) {
      console.error("Supabase client not available for updating logo.");
      return;
    }
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

    if (error) console.error('Error updating logos in DB:', error);
    else setLogosState(updatedLogos);
  };
  
  const updateFybWeekTextSettings = async (settings: Partial<Pick<FYBWeekSettings, 'title' | 'schedule' | 'activities' | 'isUnlocked'>>) => {
    if (!supabase) {
      console.error("Supabase client not available for updating FYB week settings.");
      return;
    }
    const updatedSettings = { ...fybWeekSettings, ...settings };
    const { error } = await supabase
      .from('app_settings')
      .update({ fyb_week_settings: updatedSettings })
      .eq('id', APP_SETTINGS_ID);
    
    if (error) console.error('Error updating FYB Week text settings:', error);
    else setFybWeekSettingsState(updatedSettings);
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    if (!supabase) {
      console.error("Supabase client not available for adding student.");
      return;
    }
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

    if (error) console.error('Error adding student:', error);
    else if (newStudent) setStudents(prev => [...prev, newStudent].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const updateStudent = async (studentData: Student) => {
    if (!supabase) {
      console.error("Supabase client not available for updating student.");
      return;
    }
    const originalStudent = students.find(s => s.id === studentData.id);
    if (!originalStudent) {
      console.error("Student not found for update");
      return;
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

    if (error) console.error('Error updating student:', error);
    else if (updatedStudent) setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s).sort((a,b) => a.name.localeCompare(b.name)));
  };

  const deleteStudent = async (studentId: string) => {
    if (!supabase) {
      console.error("Supabase client not available for deleting student.");
      return;
    }
    const studentToDelete = students.find(s => s.id === studentId);
    if (studentToDelete) {
      if (studentToDelete.imageSrc) await deleteFileFromSupabase(studentToDelete.imageSrc);
      if (studentToDelete.flyerImageSrc) await deleteFileFromSupabase(studentToDelete.flyerImageSrc);
    }

    const { error } = await supabase.from('students').delete().eq('id', studentId);
    if (error) console.error('Error deleting student:', error);
    else setStudents(prev => prev.filter(s => s.id !== studentId));
  };
  
  const addFybEventImage = async (file: File) => {
     if (!supabase) {
      console.error("Supabase client not available for adding FYB event image.");
      return;
    }
    const imageId = uuidv4();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const imageUrl = await uploadFileToSupabase(file, 'fyb_event_images', `${imageId}_${safeFileName}`);

    if (!imageUrl) return;

    const newImage: FYBEventImage = { id: imageId, src: imageUrl, name: file.name }; 
    const updatedImages = [...fybWeekSettings.eventImages, newImage];
    const updatedSettings = { ...fybWeekSettings, eventImages: updatedImages };
    
    const { error } = await supabase
      .from('app_settings')
      .update({ fyb_week_settings: updatedSettings })
      .eq('id', APP_SETTINGS_ID);

    if (error) console.error('Error adding FYB event image:', error);
    else setFybWeekSettingsState(updatedSettings);
  };

  const deleteFybEventImage = async (imageId: string) => {
    if (!supabase) {
      console.error("Supabase client not available for deleting FYB event image.");
      return;
    }
    const imageToDelete = fybWeekSettings.eventImages.find(img => img.id === imageId);
    if (imageToDelete?.src) { // Changed from imageToDelete?.url
      await deleteFileFromSupabase(imageToDelete.src); // Changed from imageToDelete?.url
    }
    
    const updatedImages = fybWeekSettings.eventImages.filter(img => img.id !== imageId);
    const updatedSettings = { ...fybWeekSettings, eventImages: updatedImages };

    const { error } = await supabase
      .from('app_settings')
      .update({ fyb_week_settings: updatedSettings })
      .eq('id', APP_SETTINGS_ID);

    if (error) console.error('Error deleting FYB event image:', error);
    else setFybWeekSettingsState(updatedSettings);
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
      {isLoading ? <div>Loading application data...</div> : children}
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
