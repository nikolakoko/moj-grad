import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { apiClient } from "@/lib/apiClient";
import { Complaint } from "@/types";
import { useAuth } from "./AuthContext";

interface ComplaintContextType {
  complaints: Complaint[];
  updateComplaint: (id: string, data: Partial<Complaint>) => Promise<void>;

  fetchComplaints: () => Promise<void>;
  
  submitComplaint: (data: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    photo?: string | null;
  }) => Promise<string>;


  getComplaintByToken: (token: string) => Promise<Complaint>;
}

export const ComplaintContext = createContext<ComplaintContextType | undefined>(
  undefined
);

export function ComplaintProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const { user } = useAuth();
  // ================= FETCH =================
  const fetchComplaints = async () => {
    try {
      const role = user?.role;

      let res;
      if (role === 'ADMINISTRATION_WORKER') {
        res = await apiClient("/complaints/by-department");
      } else {
        res = await apiClient("/complaints/list");
      }

      const data =
          res?.content ??
          res?.data ??
          res?.complaints ??
          res ??
          [];

      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch complaints error:", error);
      setComplaints([]);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);
  // ================= CREATE =================
  const submitComplaint = async (data: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    photo?: string | null;
  }): Promise<string> => {
    const res = await apiClient("/complaints/create", {
      method: "POST",
      body: JSON.stringify(data),
    });

    await fetchComplaints();

    return res?.token ?? res;
  };

  // ================= UPDATE =================

  const updateComplaint = async (
    id: string,
    data: Partial<Complaint>
  ): Promise<void> => {
    try {
      const res = await apiClient(`/complaints/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      setComplaints((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, ...res } : c
        )
      );
    } catch (error) {
      console.error("Update complaint error:", error);
    }
  };

  // ================= GET BY TOKEN =================
  const getComplaintByToken = async (token: string) => {
    return await apiClient(
      `/complaints/by-token?token=${encodeURIComponent(token)}`
    );
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        fetchComplaints,
        submitComplaint,
        getComplaintByToken,
         updateComplaint,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
}

// ================= HOOK =================
export function useComplaints() {
  const context = useContext(ComplaintContext);

  if (!context) {
    throw new Error("useComplaints must be used within ComplaintProvider");
  }

  return context;
}