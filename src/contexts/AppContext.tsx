
"use client";
import type { ReactNode } from 'react';
import Image from 'next/image';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Student, LogoSettings, FYBWeekSettings, AppState, FYBEventImage, AppSettingsFromSupabase } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { AssociationLogoPlaceholder } from '@/components/icons/AssociationLogoPlaceholder';

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
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [isLogoRendered, setIsLogoRendered] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
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
CRITICAL CONNECTION ERROR: 'Failed to fetch'
This means your application could NOT connect to the Supabase server.
Please meticulously verify the troubleshooting steps in the README or previous console logs.
Raw Error: ${extractedErrorMessage}`;
            console.error(troubleshootingMessage, error);
        } else {
            console.error('An unexpected error occurred while loading initial data from Supabase:', error);
        }
        
        // Fallback to defaults
        setStudents([]);
        setLogosState(defaultLogos);
        setFybWeekSettingsState(defaultFYBWeekSettings);
      } finally {
        setIsDataFetched(true);
      }
      
      const storedAdminLogin = localStorage.getItem('nazsAdminLoggedIn');
      if (storedAdminLogin === 'true') {
        setIsAdminLoggedIn(true);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isDataFetched && (isLogoRendered || !logos.associationLogo)) {
      setIsLoading(false);
    }
  }, [isDataFetched, isLogoRendered, logos.associationLogo]);
  
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

  const uploadFileToSupabase = async (fileBlob: Blob, pathPrefix: string, fileNameWithoutExt: string): Promise<string> => {
    if (!supabase) {
      throw new Error("Supabase client not available for file upload.");
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
    if (!data.publicUrl) {
      throw new Error("Upload succeeded but failed to get public URL.");
    }
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
      .upsert({ id: APP_SETTINGS_ID, logos: updatedLogos, fyb_week_settings: fybWeekSettings })
      .select()
      .single();

    if (error) throw error;
    setLogosState(updatedLogos);
  };
  
  const updateFybWeekTextSettings = async (settings: Partial<Pick<FYBWeekSettings, 'title' | 'schedule' | 'activities' | 'isUnlocked'>>) => {
    if (!supabase) throw new Error("Supabase client not available for updating FYB week settings.");

    const updatedSettings = { ...fybWeekSettings, ...settings };
    const { error } = await supabase
      .from('app_settings')
      .upsert({ id: APP_SETTINGS_ID, fyb_week_settings: updatedSettings, logos: logos })
      .select()
      .single();
    
    if (error) throw error;
    setFybWeekSettingsState(updatedSettings);
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    if (!supabase) throw new Error("Supabase client not available.");

    let profileImageUrl: string | null = studentData.image_src;
    let flyerImageUrl: string | null = studentData.flyer_image_src;

    try {
      if (studentData.image_src && studentData.image_src.startsWith('data:')) {
        const blob = dataURIToBlob(studentData.image_src);
        if (blob) {
          profileImageUrl = await uploadFileToSupabase(blob, 'student_profiles', `profile_${uuidv4()}`);
        }
      }
    } catch (e: any) {
      throw new Error(`Profile image upload failed: ${e.message}`);
    }

    try {
      if (studentData.flyer_image_src && studentData.flyer_image_src.startsWith('data:')) {
        const blob = dataURIToBlob(studentData.flyer_image_src);
        if (blob) {
          flyerImageUrl = await uploadFileToSupabase(blob, 'student_flyers', `flyer_${uuidv4()}`);
        }
      }
    } catch (e: any) {
      if (profileImageUrl && profileImageUrl !== studentData.image_src) {
        await deleteFileFromSupabase(profileImageUrl);
      }
      throw new Error(`Flyer image upload failed: ${e.message}`);
    }

    const studentToInsert = {
      ...studentData,
      id: uuidv4(),
      image_src: profileImageUrl,
      flyer_image_src: flyerImageUrl,
    };

    try {
      const { data: newStudent, error } = await supabase
        .from('students')
        .insert(studentToInsert)
        .select()
        .single();

      if (error) throw error;
      if (newStudent) setStudents(prev => [...prev, newStudent].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (e: any) {
      if (profileImageUrl && profileImageUrl !== studentData.image_src) {
        await deleteFileFromSupabase(profileImageUrl);
      }
      if (flyerImageUrl && flyerImageUrl !== studentData.flyer_image_src) {
        await deleteFileFromSupabase(flyerImageUrl);
      }
      throw new Error(`Database insert failed: ${e.message}`);
    }
  };

  const updateStudent = async (studentData: Student) => {
    if (!supabase) throw new Error("Supabase client not available.");

    const originalStudent = students.find(s => s.id === studentData.id);
    if (!originalStudent) throw new Error("Student not found for update");

    let updatedPayload = { ...studentData };

    try {
        if (studentData.image_src && studentData.image_src.startsWith('data:')) {
            if (originalStudent.image_src) await deleteFileFromSupabase(originalStudent.image_src);
            const blob = dataURIToBlob(studentData.image_src);
            if (blob) {
                updatedPayload.image_src = await uploadFileToSupabase(blob, 'student_profiles', `profile_${studentData.id}_${Date.now()}`);
            }
        } else if (studentData.image_src === null && originalStudent.image_src) {
            await deleteFileFromSupabase(originalStudent.image_src);
        }
    } catch (e: any) {
        throw new Error(`Profile image update failed: ${e.message}`);
    }

    try {
        if (studentData.flyer_image_src && studentData.flyer_image_src.startsWith('data:')) {
            if (originalStudent.flyer_image_src) await deleteFileFromSupabase(originalStudent.flyer_image_src);
            const blob = dataURIToBlob(studentData.flyer_image_src);
            if (blob) {
                updatedPayload.flyer_image_src = await uploadFileToSupabase(blob, 'student_flyers', `flyer_${studentData.id}_${Date.now()}`);
            }
        } else if (studentData.flyer_image_src === null && originalStudent.flyer_image_src) {
            await deleteFileFromSupabase(originalStudent.flyer_image_src);
        }
    } catch (e: any) {
        throw new Error(`Flyer image update failed: ${e.message}`);
    }
    
    try {
      const { id, created_at, updated_at, ...updateForDb } = updatedPayload;

      const { data: updatedStudent, error } = await supabase
        .from('students')
        .update(updateForDb)
        .eq('id', studentData.id)
        .select()
        .single();

      if (error) throw error;
      if (updatedStudent) setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (e: any) {
        throw new Error(`Database update failed: ${e.message}`);
    }
  };

  const deleteStudent = async (studentId: string) => {
    if (!supabase) throw new Error("Supabase client not available for deleting student.");
    
    const studentToDelete = students.find(s => s.id === studentId);
    if (studentToDelete) {
      if (studentToDelete.image_src) await deleteFileFromSupabase(studentToDelete.image_src);
      if (studentToDelete.flyer_image_src) await deleteFileFromSupabase(studentToDelete.flyer_image_src);
    }

    const { error } = await supabase.from('students').delete().eq('id', studentId);
    if (error) throw error;
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };
  
  const addFybEventImage = async (file: File) => {
     if (!supabase) throw new Error("Supabase client not available for adding FYB event image.");
    
    const imageId = uuidv4();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const imageUrl = await uploadFileToSupabase(file, 'fyb_event_images', `${imageId}_${safeFileName}`);

    const newImage: FYBEventImage = { id: imageId, src: imageUrl, name: file.name }; 
    const updatedImages = [...fybWeekSettings.eventImages, newImage];
    const updatedSettings = { ...fybWeekSettings, eventImages: updatedImages };
    
    const { error } = await supabase
      .from('app_settings')
      .upsert({ id: APP_SETTINGS_ID, fyb_week_settings: updatedSettings, logos: logos })
      .select()
      .single();

    if (error) throw error;
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
      .upsert({ id: APP_SETTINGS_ID, fyb_week_settings: updatedSettings, logos: logos })
      .select()
      .single();

    if (error) throw error;
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
      {isLoading ? (
        <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-background">
          <div className="w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
            {logos.associationLogo && isDataFetched ? (
              <Image 
                src={logos.associationLogo} 
                alt="Association Logo" 
                width={192} 
                height={192} 
                className="object-contain" 
                unoptimized
                onLoad={() => setIsLogoRendered(true)}
                onError={() => setIsLogoRendered(true)} // Also handle error case
              />
            ) : (
              <div className="w-full h-full animate-pulse">
                <AssociationLogoPlaceholder className="w-full h-full text-primary" />
              </div>
            )}
          </div>
          <p className="mt-4 text-lg font-headline text-primary">Loading Application Data...</p>
        </div>
      ) : (
        children
      )}
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
