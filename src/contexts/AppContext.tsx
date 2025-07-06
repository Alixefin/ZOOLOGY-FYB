
"use client";
import type { ReactNode } from 'react';
import Image from 'next/image';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Student, LogoSettings, FYBWeekSettings, AppState, FYBEventImage } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

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
  title: 'Cyber Clan FYB Week Extravaganza!',
  schedule: 'Detailed schedule coming soon...',
  activities: 'Exciting activities lineup to be announced!',
  eventImages: [],
};

const defaultAdminPin = "171225"; // Keep client-side for UI lock, not for DB auth

const APP_SETTINGS_ID = 1; // Singleton row ID for app_settings table
const STORAGE_BUCKET_NAME = 'app-public-assets';


interface AppContextType extends AppState {
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  updateLogo: (logoType: 'associationLogo' | 'schoolLogo', fileDataUrl: string | null) => Promise<void>;
  updateFybWeekTextSettings: (settings: Partial<Pick<FYBWeekSettings, 'title' | 'schedule' | 'activities' | 'isUnlocked'>>) => Promise<void>;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  addStudent: (studentData: Omit<Student, 'created_at' | 'updated_at'>) => Promise<void>;
  updateStudent: (studentData: Student) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  addFybEventImages: (files: File[]) => Promise<void>;
  deleteFybEventImage: (imageId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LoadingComponent = () => (
    <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-background">
        <div className="w-32 h-32 md:w-48 md:h-48">
            <Image
                src="/favicon.ico"
                alt="Association Logo"
                width={192}
                height={192}
                className="object-contain"
                unoptimized
                priority
            />
        </div>
    </div>
);


export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [logos, setLogosState] = useState<LogoSettings>(defaultLogos);
  const [fybWeekSettings, setFybWeekSettingsState] = useState<FYBWeekSettings>(defaultFYBWeekSettings);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    async function loadInitialData() {
      try {
        if (!supabase) {
          throw new Error("Supabase client is not initialized. Check your environment variables and supabaseClient.ts.");
        }
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase.from('students').select('*').order('name', { ascending: true });
        if (studentsError) throw studentsError;
        setStudents(studentsData || []);

        // Fetch app_settings
        const { data: settingsData, error: settingsError } = await supabase.from('app_settings').select('*').eq('id', APP_SETTINGS_ID).single();
        if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;

        if (settingsData) {
          setLogosState(settingsData.logos || defaultLogos);
          setFybWeekSettingsState(settingsData.fyb_week_settings || defaultFYBWeekSettings);
        } else {
          setLogosState(defaultLogos);
          setFybWeekSettingsState(defaultFYBWeekSettings);
        }
      } catch (error: any) {
        console.error('An unexpected error occurred while loading initial data from Supabase:', error);
        setStudents([]);
        setLogosState(defaultLogos);
        setFybWeekSettingsState(defaultFYBWeekSettings);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();

    const storedAdminLogin = localStorage.getItem('nacosAdminLoggedIn');
    if (storedAdminLogin === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('nacosAdminLoggedIn', isAdminLoggedIn.toString());
    }
  }, [isAdminLoggedIn, isMounted]);

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
    if (!supabase) throw new Error("Supabase client not available for file upload.");
    const fileExt = fileBlob.type.split('/')[1] || 'png';
    const fullFileName = `${fileNameWithoutExt}.${fileExt}`;
    const filePath = `${pathPrefix}/${Date.now()}_${fullFileName}`;
    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET_NAME).upload(filePath, fileBlob, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(STORAGE_BUCKET_NAME).getPublicUrl(filePath);
    if (!data.publicUrl) throw new Error("Upload succeeded but failed to get public URL.");
    return data.publicUrl;
  };

  const deleteFileFromSupabase = async (fileUrl: string | null): Promise<void> => {
    if (!fileUrl || !supabase) return;
    const isSupabaseUrl = fileUrl.includes('iwkslfapaxafwghfhefu.supabase.co');
    if (!isSupabaseUrl) return;
    try {
      const url = new URL(fileUrl);
      const pathSegments = url.pathname.split('/');
      const bucketNameIndex = pathSegments.findIndex(segment => segment === STORAGE_BUCKET_NAME);
      if (bucketNameIndex === -1 || bucketNameIndex + 1 >= pathSegments.length) {
        console.warn("Could not determine file path from Supabase URL for deletion:", fileUrl);
        return;
      }
      const filePath = pathSegments.slice(bucketNameIndex + 1).join('/');
      const { error } = await supabase.storage.from(STORAGE_BUCKET_NAME).remove([filePath]);
      if (error) console.warn(`Could not delete file '${filePath}' from storage: ${error.message}`);
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
    const { error } = await supabase.from('app_settings').upsert({ id: APP_SETTINGS_ID, logos: updatedLogos });
    if (error) throw error;
    setLogosState(updatedLogos);
  };
  
  const updateFybWeekTextSettings = async (settings: Partial<Pick<FYBWeekSettings, 'title' | 'schedule' | 'activities' | 'isUnlocked'>>) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const currentSettings = (await supabase.from('app_settings').select('fyb_week_settings').eq('id', APP_SETTINGS_ID).single()).data?.fyb_week_settings || defaultFYBWeekSettings;
    const updatedSettings = { ...currentSettings, ...settings };
    const { error } = await supabase.from('app_settings').upsert({ id: APP_SETTINGS_ID, fyb_week_settings: updatedSettings });
    if (error) throw error;
    setFybWeekSettingsState(updatedSettings);
  };

  const addStudent = async (studentData: Omit<Student, 'created_at' | 'updated_at'>) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { data: newStudent, error } = await supabase.from('students').insert(studentData).select().single();
    if (error) throw error;
    if (newStudent) setStudents(prev => [...prev, newStudent].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const updateStudent = async (studentData: Student) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { id, created_at, updated_at, ...updatePayload } = studentData;
    const { data: updatedStudent, error } = await supabase.from('students').update(updatePayload).eq('id', studentData.id).select().single();
    if (error) throw error;
    if (updatedStudent) setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s).sort((a,b) => a.name.localeCompare(b.name)));
  };

  const deleteStudent = async (studentId: string) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { error } = await supabase.from('students').delete().eq('id', studentId);
    if (error) throw error;
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };
  
  const addFybEventImages = async (files: File[]) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const currentSettings = (await supabase.from('app_settings').select('fyb_week_settings').eq('id', APP_SETTINGS_ID).single()).data?.fyb_week_settings || defaultFYBWeekSettings;
    const uploadPromises = files.map(file => {
      const imageId = uuidv4();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      return uploadFileToSupabase(file, 'fyb_event_images', `${imageId}_${safeFileName}`)
        .then(imageUrl => ({ id: imageId, src: imageUrl, name: file.name }));
    });
    try {
      const newImages: FYBEventImage[] = await Promise.all(uploadPromises);
      const updatedImages = [...currentSettings.eventImages, ...newImages];
      const updatedSettings = { ...currentSettings, eventImages: updatedImages };
      const { error } = await supabase.from('app_settings').upsert({ id: APP_SETTINGS_ID, fyb_week_settings: updatedSettings });
      if (error) {
        newImages.forEach(img => deleteFileFromSupabase(img.src));
        throw error;
      }
      setFybWeekSettingsState(updatedSettings);
    } catch (uploadError) {
      throw new Error("One or more image uploads failed. Please try again.");
    }
  };

  const deleteFybEventImage = async (imageId: string) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const currentSettings = (await supabase.from('app_settings').select('fyb_week_settings').eq('id', APP_SETTINGS_ID).single()).data?.fyb_week_settings || defaultFYBWeekSettings;
    const imageToDelete = currentSettings.eventImages.find(img => img.id === imageId);
    if (imageToDelete?.src) await deleteFileFromSupabase(imageToDelete.src);
    const updatedImages = currentSettings.eventImages.filter(img => img.id !== imageId);
    const updatedSettings = { ...currentSettings, eventImages: updatedImages };
    const { error } = await supabase.from('app_settings').upsert({ id: APP_SETTINGS_ID, fyb_week_settings: updatedSettings });
    if (error) throw error;
    setFybWeekSettingsState(updatedSettings);
  };

  if (!isMounted || isLoading) {
    return <LoadingComponent />;
  }

  return (
    <AppContext.Provider value={{
      students, setStudents, 
      logos, 
      fybWeekSettings, 
      adminPin: defaultAdminPin,
      isAdminLoggedIn, 
      loginAdmin, logoutAdmin,
      addStudent, updateStudent, deleteStudent,
      updateLogo,
      updateFybWeekTextSettings,
      addFybEventImages, deleteFybEventImage
    }}>
      {children}
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
