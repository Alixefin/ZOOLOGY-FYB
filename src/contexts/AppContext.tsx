
"use client";
import type { ReactNode } from 'react';
import Image from 'next/image';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Student, LogoSettings, VotingSettings, FYBWeekSettings, AppState, Award, AwardNomination, FYBWeekEvent, FYBWeekGalleryImage } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/hooks/use-toast";
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
  roastBackground: null,
};

const defaultVotingSettings: VotingSettings = {
  isVotingActive: false,
};

const defaultFybWeekSettings: FYBWeekSettings = {
  isFybWeekActive: false,
  startDate: null,
  scheduleDesignImage: null,
};

const defaultAdminPin = "171225"; 

const APP_SETTINGS_ID = 1; 
const STORAGE_BUCKET_NAME = 'app-public-assets';


interface AppContextType extends AppState {
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  updateLogo: (logoType: 'associationLogo' | 'schoolLogo' | 'roastBackground', fileDataUrl: string | null) => Promise<void>;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  addStudent: (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateStudent: (studentData: Student) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  updateVotingStatus: (isActive: boolean) => Promise<void>;
  updateFybWeekStatus: (isActive: boolean) => Promise<void>;
  updateFybWeekSettings: (settings: FYBWeekSettings) => Promise<void>;
  addAward: (awardData: Pick<Award, 'name' | 'description'>) => Promise<void>;
  deleteAward: (awardId: string) => Promise<void>;
  addNomination: (nominationData: Pick<AwardNomination, 'award_id' | 'student_id'>) => Promise<void>;
  deleteNomination: (nominationId: string) => Promise<void>;
  submitVotes: (votes: { awardId: string; nominationId: string }[]) => Promise<void>;
  updateFybWeekEvent: (eventData: FYBWeekEvent) => Promise<void>;
  addGalleryImage: (eventId: string, imageUrl: string) => Promise<void>;
  deleteGalleryImage: (imageId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LoadingComponent = () => (
    <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-white dark:bg-gray-950">
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
  const [votingSettings, setVotingSettingsState] = useState<VotingSettings>(defaultVotingSettings);
  const [fybWeekSettings, setFybWeekSettingsState] = useState<FYBWeekSettings>(defaultFybWeekSettings);
  const [awards, setAwards] = useState<Award[]>([]);
  const [nominations, setNominations] = useState<AwardNomination[]>([]);
  const [fybWeekEvents, setFybWeekEvents] = useState<FYBWeekEvent[]>([]);
  const [fybWeekGallery, setFybWeekGallery] = useState<FYBWeekGalleryImage[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  const seedFybWeekEvents = async () => {
    if (!supabase) return;
    const defaultEvents = [
      { day_index: 0, title: "Back to School (Primary/Secondary)", description: "Relive your childhood memories by dressing up in your primary or secondary school uniforms!" },
      { day_index: 1, title: "Jersey Day", description: "Represent your favorite sports team by wearing their jersey." },
      { day_index: 2, title: "Talent Hunt", description: "Showcase your hidden talents, from singing and dancing to magic tricks and stand-up comedy." },
      { day_index: 3, title: "Traditional Day / Food Competition", description: "Celebrate our diverse cultures with traditional attires and a delicious food competition." },
      { day_index: 4, title: "Dinner / Award Night", description: "A grand finale to celebrate our achievements with a formal dinner and award ceremony." },
    ];
    const { data, error } = await supabase.from('fyb_week_events').insert(defaultEvents).select();
    if (error) {
      console.error("Error seeding FYB Week events:", error);
    } else if (data) {
      setFybWeekEvents(data.sort((a,b) => a.day_index - b.day_index));
    }
  }

  useEffect(() => {
    setIsMounted(true);
    
    async function loadInitialData() {
      setIsLoading(true);
      if (!supabase) {
          console.error("Supabase client is not initialized.");
          setIsLoading(false);
          return;
      }
      try {
        const settingsRes = await supabase.from('app_settings').select('*').eq('id', APP_SETTINGS_ID).single();
        if (settingsRes.error && settingsRes.error.code !== 'PGRST116') {
          console.error("Error fetching app_settings:", settingsRes.error);
        } else if (settingsRes.data) {
          setLogosState(settingsRes.data.logos || defaultLogos);
          setVotingSettingsState(settingsRes.data.voting_settings || defaultVotingSettings);
          setFybWeekSettingsState({ ...defaultFybWeekSettings, ...settingsRes.data.fyb_week_settings });
        }

        const studentsRes = await supabase.from('students').select('*').order('name', { ascending: true });
        if (studentsRes.error) console.error("Error fetching students:", studentsRes.error);
        else setStudents(studentsRes.data || []);

        const awardsRes = await supabase.from('awards').select('*').order('name', { ascending: true });
        if (awardsRes.error) console.error("Error fetching awards:", awardsRes.error);
        else setAwards(awardsRes.data || []);
        
        const nominationsRes = await supabase.from('award_nominations').select('*, students(name, image_src)');
        if (nominationsRes.error) {
            console.error("Error fetching nominations:", nominationsRes.error);
        } else {
            setNominations(nominationsRes.data || []);
        }

        const fybEventsRes = await supabase.from('fyb_week_events').select('*').order('day_index', { ascending: true });
        if (fybEventsRes.error) {
            console.error("Error fetching FYB events:", fybEventsRes.error);
        } else {
            if (fybEventsRes.data.length === 0) {
              await seedFybWeekEvents();
            } else {
              setFybWeekEvents(fybEventsRes.data.sort((a,b) => a.day_index - b.day_index));
            }
        }

        const fybGalleryRes = await supabase.from('fyb_week_gallery').select('*').order('created_at', { ascending: true });
        if (fybGalleryRes.error) console.error("Error fetching FYB gallery:", fybGalleryRes.error);
        else setFybWeekGallery(fybGalleryRes.data || []);

      } catch (error: any) {
         console.error('An unexpected error occurred while loading initial data from Supabase:', error);
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
    const isSupabaseUrl = fileUrl.includes('supabase.co');
    if (!isSupabaseUrl) return;
    try {
      const url = new URL(fileUrl);
      const pathSegments = url.pathname.split('/');
      const bucketNameIndex = pathSegments.findIndex(segment => segment === STORAGE_BUCKET_NAME);
      if (bucketNameIndex === -1 || bucketNameIndex + 1 >= pathSegments.length) {
        return;
      }
      const filePath = pathSegments.slice(bucketNameIndex + 1).join('/');
      const { error } = await supabase.storage.from(STORAGE_BUCKET_NAME).remove([filePath]);
      if (error) console.warn(`Could not delete file '${filePath}' from storage: ${error.message}`);
    } catch (e) {
      console.error("Error parsing or deleting file URL:", fileUrl, e);
    }
  };

  const updateLogo = async (logoType: 'associationLogo' | 'schoolLogo' | 'roastBackground', fileDataUrl: string | null) => {
    if (!supabase) throw new Error("Supabase client not available.");
    let newLogoUrl: string | null = null;
    
    const {data: currentData, error: fetchError} = await supabase.from('app_settings').select('*').eq('id', APP_SETTINGS_ID).single();
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const currentSettings = currentData || { id: APP_SETTINGS_ID };
    const currentLogos = currentSettings.logos || defaultLogos;
    const currentLogoUrl = currentLogos[logoType];
    
    if (fileDataUrl) { 
      const blob = dataURIToBlob(fileDataUrl);
      if (blob) {
        if (currentLogoUrl) await deleteFileFromSupabase(currentLogoUrl);
        newLogoUrl = await uploadFileToSupabase(blob, 'logos', logoType);
      }
    } else if (currentLogoUrl) {
      await deleteFileFromSupabase(currentLogoUrl);
    }
    const updatedLogos = { ...currentLogos, [logoType]: newLogoUrl };
    
    const payload = { ...currentSettings, logos: updatedLogos };

    const { error } = await supabase.from('app_settings').upsert(payload);
    if (error) throw error;
    setLogosState(updatedLogos);
  };
  
  const addStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const studentWithId = { ...studentData, id: uuidv4() };

    const { data: newStudent, error } = await supabase.from('students').insert(studentWithId).select().single();
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
  
  const updateVotingStatus = async (isActive: boolean) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const {data: currentData, error: fetchError} = await supabase.from('app_settings').select('*').eq('id', APP_SETTINGS_ID).single();
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    const currentSettings = currentData || { id: APP_SETTINGS_ID };
    const newVotingSettings = { ...currentSettings.voting_settings, isVotingActive: isActive };
    const { error } = await supabase.from('app_settings').upsert({ ...currentSettings, voting_settings: newVotingSettings });
    if (error) throw error;
    setVotingSettingsState(newVotingSettings);
  };

  const updateFybWeekStatus = async (isActive: boolean) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const {data: currentData, error: fetchError} = await supabase.from('app_settings').select('*').eq('id', APP_SETTINGS_ID).single();
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    const currentSettings = currentData || { id: APP_SETTINGS_ID };
    const newFybWeekSettings = { ...fybWeekSettings, isFybWeekActive: isActive };
    const { error } = await supabase.from('app_settings').upsert({ ...currentSettings, fyb_week_settings: newFybWeekSettings });
    if (error) throw error;
    setFybWeekSettingsState(newFybWeekSettings);
  };
  
  const updateFybWeekSettings = async (settings: FYBWeekSettings) => {
      if (!supabase) throw new Error("Supabase client not available.");
      
      let finalSettings = { ...settings };
      const oldImageUrl = fybWeekSettings.scheduleDesignImage;
      const newImageDataUrl = settings.scheduleDesignImage;

      // Check if a new image was uploaded
      if (newImageDataUrl && newImageDataUrl.startsWith('data:image')) {
          const blob = dataURIToBlob(newImageDataUrl);
          if (blob) {
              if (oldImageUrl) await deleteFileFromSupabase(oldImageUrl);
              const newUrl = await uploadFileToSupabase(blob, 'fyb-week-images', 'schedule-design');
              finalSettings.scheduleDesignImage = newUrl;
          }
      } else if (oldImageUrl && !newImageDataUrl) {
          await deleteFileFromSupabase(oldImageUrl);
      }

      const { data: currentData, error: fetchError } = await supabase.from('app_settings').select('id').eq('id', APP_SETTINGS_ID).single();
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      const currentSettings = currentData || { id: APP_SETTINGS_ID };
      
      const { error } = await supabase.from('app_settings').upsert({ ...currentSettings, fyb_week_settings: finalSettings });
      if (error) throw error;
      setFybWeekSettingsState(finalSettings);
  };

  const addAward = async (awardData: Pick<Award, 'name' | 'description'>) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { data, error } = await supabase.from('awards').insert(awardData).select().single();
    if (error) throw error;
    setAwards(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const deleteAward = async (awardId: string) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { error } = await supabase.from('awards').delete().eq('id', awardId);
    if (error) throw error;
    setAwards(prev => prev.filter(a => a.id !== awardId));
    setNominations(prev => prev.filter(n => n.award_id !== awardId));
  };

  const addNomination = async (nominationData: Pick<AwardNomination, 'award_id' | 'student_id'>) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { data, error } = await supabase.from('award_nominations').insert(nominationData).select('*, students(name, image_src)').single();
    if (error) throw error;
    setNominations(prev => [...prev, data]);
  };

  const deleteNomination = async (nominationId: string) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { error } = await supabase.from('award_nominations').delete().eq('id', nominationId);
    if (error) throw error;
    setNominations(prev => prev.filter(n => n.id !== nominationId));
  };
  
  const submitVotes = async (votesToSubmit: { awardId: string; nominationId: string }[]) => {
    if (!supabase) throw new Error("Supabase client not available.");
    
    const votePromises = votesToSubmit.map(vote => 
      supabase.rpc('increment_vote', { nomination_id_in: vote.nominationId })
    );
    
    const results = await Promise.allSettled(votePromises);

    const failedVotes = results.filter(result => result.status === 'rejected');
    if (failedVotes.length > 0) {
      console.error("Some votes failed to submit:", failedVotes);
      throw new Error("Could not submit all votes. Please try again.");
    }

    setNominations(prevNominations => {
        return prevNominations.map(nom => {
            const didVoteForThis = votesToSubmit.find(v => v.nominationId === nom.id);
            if (didVoteForThis) {
                return { ...nom, votes: nom.votes + 1 };
            }
            return nom;
        });
    });
  };

  const updateFybWeekEvent = async (eventData: Omit<FYBWeekEvent, 'image_src'>) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { id, created_at, ...updatePayload } = eventData;
    const { data: updatedEvent, error } = await supabase.from('fyb_week_events').update(updatePayload).eq('id', id).select().single();
    if (error) throw error;
    if (updatedEvent) {
      setFybWeekEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e).sort((a,b)=> a.day_index - b.day_index));
    }
  };

  const addGalleryImage = async (eventId: string, fileDataUrl: string) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const blob = dataURIToBlob(fileDataUrl);
    if (!blob) throw new Error("Failed to convert image data.");
    
    const imageUrl = await uploadFileToSupabase(blob, 'fyb-week-gallery', `event-${eventId}-${Date.now()}`);
    
    const { data, error } = await supabase.from('fyb_week_gallery').insert({ event_id: eventId, image_url: imageUrl }).select().single();
    if (error) {
        await deleteFileFromSupabase(imageUrl); // Clean up on db insert failure
        throw error;
    }
    setFybWeekGallery(prev => [...prev, data]);
  };
  
  const deleteGalleryImage = async (imageId: string) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const imageToDelete = fybWeekGallery.find(img => img.id === imageId);
    if (!imageToDelete) return;
    
    await deleteFileFromSupabase(imageToDelete.image_url);
    const { error } = await supabase.from('fyb_week_gallery').delete().eq('id', imageId);
    if (error) throw error;
    
    setFybWeekGallery(prev => prev.filter(img => img.id !== imageId));
  };


  if (!isMounted || isLoading) {
    return <LoadingComponent />;
  }

  return (
    <AppContext.Provider value={{
      students, setStudents, 
      logos, 
      votingSettings,
      fybWeekSettings,
      fybWeekEvents,
      fybWeekGallery,
      awards,
      nominations,
      adminPin: defaultAdminPin,
      isAdminLoggedIn, 
      loginAdmin, logoutAdmin,
      addStudent, updateStudent, deleteStudent,
      updateLogo,
      updateVotingStatus,
      updateFybWeekStatus,
      updateFybWeekSettings,
      addAward, deleteAward,
      addNomination, deleteNomination,
      submitVotes,
      updateFybWeekEvent,
      addGalleryImage,
      deleteGalleryImage,
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

    
