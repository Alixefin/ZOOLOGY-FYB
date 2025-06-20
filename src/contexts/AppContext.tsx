
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
          // No settings found, use defaults. Consider creating a default row if this is first setup.
          setLogosState(defaultLogos);
          setFybWeekSettingsState(defaultFYBWeekSettings);
           // Optionally, create the default settings row. The schema.sql should handle this.
           // await supabase.from('app_settings').insert([{ id: APP_SETTINGS_ID, logos: defaultLogos, fyb_week_settings: defaultFYBWeekSettings }]);
        }

      } catch (error: any) {
        let errorDetailsString = "Error object could not be fully stringified.";
        try {
            errorDetailsString = JSON.stringify(error, Object.getOwnPropertyNames(error));
        } catch (e) {
            // If stringification fails, errorDetailsString will retain its default message
        }
        console.error('Error loading initial data (raw, stringified with own props):', errorDetailsString);
        
        // Log individual properties if they exist
        if (error && typeof error === 'object') {
            if ('message' in error) {
              console.error('Error message:', (error as { message: string }).message);
            }
            if ('details' in error) {
              console.error('Error details:', (error as { details: string }).details);
            }
            if ('hint' in error) {
              console.error('Error hint:', (error as { hint: string }).hint);
            }
            if ('code' in error) {
                console.error('Error code:', (error as { code: string }).code);
            }
            if (Object.keys(error).length === 0 && !error.message) {
                 console.error('The caught error object appears to be empty or lacks standard error properties.');
            }
        } else if (error) {
            console.error('Caught error is not a typical object:', String(error));
        }

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
    const fileExt = fileBlob.type.split('/')[1] || 'png'; // Default to png if type is missing or malformed
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
    if (!fileUrl) return;
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
    const updatedSettings = { ...fybWeekSettings, ...settings };
    const { error } = await supabase
      .from('app_settings')
      .update({ fyb_week_settings: updatedSettings })
      .eq('id', APP_SETTINGS_ID);
    
    if (error) console.error('Error updating FYB Week text settings:', error);
    else setFybWeekSettingsState(updatedSettings);
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
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
    const imageId = uuidv4();
    // Ensure filename is URL-safe or use a generic name if file.name is problematic
    const safeFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const imageUrl = await uploadFileToSupabase(file, 'fyb_event_images', `${imageId}_${safeFileName}`);

    if (!imageUrl) return;

    const newImage: FYBEventImage = { id: imageId, url: imageUrl, name: file.name }; // Store original name for display
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
    const imageToDelete = fybWeekSettings.eventImages.find(img => img.id === imageId);
    if (imageToDelete?.url) {
      await deleteFileFromSupabase(imageToDelete.url);
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

