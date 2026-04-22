import React, { createContext, useContext, ReactNode } from 'react';
import { apiClient } from '@/lib/apiClient';
 
interface ComplaintContextType {
  submitComplaint: (data: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    photo?: string | null;
  }) => Promise<string>; // returns tracking token
  getComplaintByToken: (token: string) => Promise<any>;
}
 
const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);
 
export function ComplaintProvider({ children }: { children: ReactNode }) {
  const submitComplaint = async (data: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    photo?: string | null;
  }): Promise<string> => {
    const response = await apiClient('/complaints/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.token;
  };
 
  const getComplaintByToken = async (token: string) => {
    return await apiClient(`/complaints/by-token?token=${encodeURIComponent(token)}`);
  };
 
  return (
    <ComplaintContext.Provider value={{ submitComplaint, getComplaintByToken }}>
      {children}
    </ComplaintContext.Provider>
  );
}
 
export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within ComplaintProvider');
  }
  return context;
}
 