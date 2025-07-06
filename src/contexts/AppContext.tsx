
"use client";
import type { ReactNode } from 'react';
import Image from 'next/image';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Student, LogoSettings, VotingSettings, FYBWeekSettings, AppState, Award, AwardNomination } from '@/types';
import { supabase } from '@/lib/supabaseClient';

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

const defaultVotingSettings: VotingSettings = {
  isVotingActive: false,
};

const defaultFybWeekSettings: FYBWeekSettings = {
  isFybWeekActive: false,
};

const defaultAdminPin = "171225"; 

const APP_SETTINGS_ID = 1; 
const STORAGE_BUCKET_NAME = 'app-public-assets';


interface AppContextType extends AppState {
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  updateLogo: (logoType: 'associationLogo' | 'schoolLogo', fileDataUrl: string | null) => Promise<void>;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  addStudent: (studentData: Omit<Student, 'created_at' | 'updated_at'>) => Promise<void>;
  updateStudent: (studentData: Student) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  updateVotingStatus: (isActive: boolean) => Promise<void>;
  updateFybWeekStatus: (isActive: boolean) => Promise<void>;
  addAward: (awardData: Pick<Award, 'name' | 'description'>) => Promise<void>;
  deleteAward: (awardId: string) => Promise<void>;
  addNomination: (nominationData: Pick<AwardNomination, 'award_id' | 'student_id'>) => Promise<void>;
  deleteNomination: (nominationId: string) => Promise<void>;
  submitVotes: (votes: { awardId: string; nominationId: string }[]) => Promise<void>;
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
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    async function loadInitialData() {
      try {
        if (!supabase) {
          throw new Error("Supabase client is not initialized.");
        }
        
        const studentsRes = await supabase.from('students').select('*').order('name', { ascending: true });
        if (studentsRes.error) throw { source: 'students', details: studentsRes.error };
        setStudents(studentsRes.data || []);

        const settingsRes = await supabase.from('app_settings').select('*').eq('id', APP_SETTINGS_ID).single();
        if (settingsRes.error && settingsRes.error.code !== 'PGRST116') {
           throw { source: 'app_settings', details: settingsRes.error };
        }
        if (settingsRes.data) {
          setLogosState(settingsRes.data.logos || defaultLogos);
          setVotingSettingsState(settingsRes.data.voting_settings || defaultVotingSettings);
          setFybWeekSettingsState(settingsRes.data.fyb_week_settings || defaultFybWeekSettings);
        }

        const awardsRes = await supabase.from('awards').select('*').order('name', { ascending: true });
        if (awardsRes.error) throw { source: 'awards', details: awardsRes.error };
        setAwards(awardsRes.data || []);

        const nominationsRes = await supabase.from('award_nominations').select('*, students(name, image_src)');
        if (nominationsRes.error) throw { source: 'nominations', details: nominationsRes.error };
        setNominations(nominationsRes.data || []);

      } catch (error: any) {
        console.error(
          `An error occurred while loading data from Supabase table "${error.source || 'unknown'}":`, 
          error.details || error
        );
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
    if (!supabase) throw new Error("Supabase client not available.");
    let newLogoUrl: string | null = null;
    const {data: currentData} = await supabase.from('app_settings').select('logos').eq('id', APP_SETTINGS_ID).single();
    const currentSettings = currentData?.logos || defaultLogos;
    const currentLogoUrl = currentSettings[logoType];
    
    if (fileDataUrl) { 
      const blob = dataURIToBlob(fileDataUrl);
      if (blob) {
        if (currentLogoUrl) await deleteFileFromSupabase(currentLogoUrl);
        newLogoUrl = await uploadFileToSupabase(blob, 'logos', logoType);
      }
    } else if (currentLogoUrl) {
      await deleteFileFromSupabase(currentLogoUrl);
    }
    const updatedLogos = { ...currentSettings, [logoType]: newLogoUrl };
    const { error } = await supabase.from('app_settings').upsert({ id: APP_SETTINGS_ID, logos: updatedLogos });
    if (error) throw error;
    setLogosState(updatedLogos);
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
  
  const updateVotingStatus = async (isActive: boolean) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const newVotingSettings = { ...votingSettings, isVotingActive: isActive };
    const { error } = await supabase.from('app_settings').upsert({ id: APP_SETTINGS_ID, voting_settings: newVotingSettings });
    if (error) throw error;
    setVotingSettingsState(newVotingSettings);
  };

  const updateFybWeekStatus = async (isActive: boolean) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const newFybWeekSettings = { ...fybWeekSettings, isFybWeekActive: isActive };
    const { error } = await supabase.from('app_settings').upsert({ id: APP_SETTINGS_ID, fyb_week_settings: newFybWeekSettings });
    if (error) throw error;
    setFybWeekSettingsState(newFybWeekSettings);
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

  if (!isMounted || isLoading) {
    return <LoadingComponent />;
  }

  return (
    <AppContext.Provider value={{
      students, setStudents, 
      logos, 
      votingSettings,
      fybWeekSettings,
      awards,
      nominations,
      adminPin: defaultAdminPin,
      isAdminLoggedIn, 
      loginAdmin, logoutAdmin,
      addStudent, updateStudent, deleteStudent,
      updateLogo,
      updateVotingStatus,
      updateFybWeekStatus,
      addAward, deleteAward,
      addNomination, deleteNomination,
      submitVotes
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
