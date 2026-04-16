export type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export type Department =
  | 'INFRASTRUCTURE'
  | 'ENVIRONMENT'
  | 'PUBLIC_SAFETY'
  | 'UTILITIES'
  | 'OTHER';


export type UserRole =
  | 'CITIZEN'
  | 'ADMINISTRATION_WORKER'
  | 'ADMIN';

export type WorkerStatus = 'INVITED' | 'REGISTERED';

export interface Complaint {
  id: string;
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  image?: string;
  status: ComplaintStatus;
  priority: Priority;
  department: Department;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  department?: Department;
  enabled: boolean;
}


export interface Worker extends User {
  role: 'ADMINISTRATION_WORKER'; 
  status: WorkerStatus;
  invitedAt?: string;
  registeredAt?: string;
}