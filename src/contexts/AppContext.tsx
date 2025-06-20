
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Student, LogoSettings, FYBWeekSettings, AppState } from '@/types';

const defaultStudents: Student[] = [
  {
    id: '1',
    name: 'Idoko Sarah',
    nickname: 'Non',
    birthday: '10/22/2005',
    relationshipStatus: 'Single',
    stateOfOrigin: 'Kogi state',
    lga: 'OFU LGA',
    favouriteCourse: 'ZOO 202',
    favouriteLecturer: 'DR JOY ATAWODI',
    favouriteCoursemates: ['Juwon', 'Martha', 'Stephanie', 'Gloria', 'Charity'],
    hobbies: ['Sleeping', 'drawing wears'],
    postsHeld: 'Non',
    bestLevel: '200 level',
    worstLevel: '100 level',
    classRepQuote: 'What the fuck, what the fuck',
    partingWords: "It's not about how you start, but how you finish.",
    imageSrc: 'https://placehold.co/300x400.png',
    flyerImageSrc: null,
  },
  {
    id: '2',
    name: 'Adekunle Gold',
    nickname: 'AG Baby',
    birthday: '01/28/1990',
    relationshipStatus: 'Married',
    stateOfOrigin: 'Lagos State',
    lga: 'Ifako-Ijaiye',
    favouriteCourse: 'ZOO 401 - Evolution',
    favouriteLecturer: 'Prof. Wande Coal',
    favouriteCoursemates: ['Simi', 'Falz'],
    hobbies: ['Singing', 'Fashion'],
    postsHeld: 'Social Prefect',
    bestLevel: '300 level',
    worstLevel: '100 level',
    classRepQuote: 'Orente no dey die!',
    partingWords: 'Work hard, stay humble.',
    imageSrc: 'https://placehold.co/300x400.png',
    flyerImageSrc: null,
  },
];

const defaultLogos: LogoSettings = {
  associationLogo: null, // Will use placeholder component if null
  schoolLogo: null, // Will use placeholder component if null
};

const defaultFYBWeekSettings: FYBWeekSettings = {
  isUnlocked: false,
  title: 'FYB Week Extravaganza!',
  schedule: 'Detailed schedule coming soon...',
  activities: 'Exciting activities lineup to be announced!',
  eventImages: [],
};

const defaultAdminPin = "171225";

interface AppContextType extends AppState {
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setLogos: React.Dispatch<React.SetStateAction<LogoSettings>>;
  setFybWeekSettings: React.Dispatch<React.SetStateAction<FYBWeekSettings>>;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  addFybEventImage: (file: File) => void;
  deleteFybEventImage: (imageId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [logos, setLogos] = useState<LogoSettings>(defaultLogos);
  const [fybWeekSettings, setFybWeekSettings] = useState<FYBWeekSettings>(defaultFYBWeekSettings);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    // Load state from localStorage on initial mount
    const storedStudents = localStorage.getItem('nazsStudents');
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    } else {
      setStudents(defaultStudents);
    }

    const storedLogos = localStorage.getItem('nazsLogos');
    if (storedLogos) {
      setLogos(JSON.parse(storedLogos));
    }

    const storedFybWeekSettings = localStorage.getItem('nazsFybWeekSettings');
    if (storedFybWeekSettings) {
      setFybWeekSettings(JSON.parse(storedFybWeekSettings));
    }
    
    const storedAdminLogin = localStorage.getItem('nazsAdminLoggedIn');
    if (storedAdminLogin === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nazsStudents', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('nazsLogos', JSON.stringify(logos));
  }, [logos]);

  useEffect(() => {
    localStorage.setItem('nazsFybWeekSettings', JSON.stringify(fybWeekSettings));
  }, [fybWeekSettings]);
  
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

  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = { ...studentData, id: Date.now().toString() };
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };
  
  const addFybEventImage = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImage = {
        id: Date.now().toString(),
        src: reader.result as string,
        name: file.name,
      };
      setFybWeekSettings(prev => ({
        ...prev,
        eventImages: [...prev.eventImages, newImage],
      }));
    };
    reader.readAsDataURL(file);
  };

  const deleteFybEventImage = (imageId: string) => {
    setFybWeekSettings(prev => ({
      ...prev,
      eventImages: prev.eventImages.filter(img => img.id !== imageId),
    }));
  };


  return (
    <AppContext.Provider value={{
      students, setStudents,
      logos, setLogos,
      fybWeekSettings, setFybWeekSettings,
      adminPin: defaultAdminPin,
      isAdminLoggedIn, loginAdmin, logoutAdmin,
      addStudent, updateStudent, deleteStudent,
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
