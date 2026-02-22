import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  writeBatch
} from 'firebase/firestore';

export type ReportStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved';
export type ReportPriority = 'low' | 'medium' | 'high' | 'critical';
export type WasteType = 'plastic' | 'organic' | 'hazardous' | 'electronic' | 'mixed';

export interface Report {
  id: string;
  title: string;
  description: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  wasteType: WasteType;
  status: ReportStatus;
  priority: ReportPriority;
  latitude: number;
  longitude: number;
  address: string;
  createdAt: string;
  assignedTo?: string;
  aiConfidence: number;
  creditsEarned: number;
  beforeImage?: string;
  afterImage?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  rating: number;
  tasksCompleted: number;
  activeTasks: number;
  maxTasks: number;
  zone: string;
  active: boolean;
}

interface ReportsContextValue {
  reports: Report[];
  staff: StaffMember[];
  addReport: (report: Omit<Report, 'id'>) => Promise<void>;
  updateReport: (id: string, updates: Partial<Report>) => Promise<void>;
  bulkUpdateReports: (ids: string[], updates: Partial<Report>) => Promise<void>;
  getReportsByStatus: (status: ReportStatus) => Report[];
  getBestAvailableStaff: () => StaffMember | null;
  isLoading: boolean;
}

const ReportsContext = createContext<ReportsContextValue | null>(null);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportsLoaded, setReportsLoaded] = useState(false);
  const [staffLoaded, setStaffLoaded] = useState(false);

  useEffect(() => {
    const reportsQuery = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const staffQuery = query(collection(db, 'staff'), orderBy('name', 'asc'));

    const unsubscribeReports = onSnapshot(reportsQuery,
      async (snapshot) => {
        const reportData = snapshot.docs.map(docItem => ({
          id: docItem.id,
          ...docItem.data()
        })) as Report[];

        setReports(reportData);
        setReportsLoaded(true);
      },
      (error) => {
        console.error("Firestore Snapshot Error:", error.message);
        setReportsLoaded(true);
      }
    );

    const unsubscribeStaff = onSnapshot(staffQuery,
      (snapshot) => {
        const staffData = snapshot.docs.map(docItem => ({
          id: docItem.id,
          ...docItem.data()
        })) as StaffMember[];
        setStaff(staffData);
        setStaffLoaded(true);
      },
      (error) => {
        console.error("Firestore Staff Snapshot Error:", error.message);
        setStaffLoaded(true);
      }
    );

    return () => {
      unsubscribeReports();
      unsubscribeStaff();
    };
  }, []);

  useEffect(() => {
    if (reportsLoaded && staffLoaded) {
      setIsLoading(false);
    }
  }, [reportsLoaded, staffLoaded]);

  const addReport = async (report: Omit<Report, 'id'>) => {
    try {
      await addDoc(collection(db, 'reports'), {
        ...report,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding report:', error);
    }
  };

  const updateReport = async (id: string, updates: Partial<Report>) => {
    try {
      await updateDoc(doc(db, 'reports', id), updates);
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const bulkUpdateReports = async (ids: string[], updates: Partial<Report>) => {
    try {
      const batch = writeBatch(db);
      ids.forEach(id => {
        const reportRef = doc(db, 'reports', id);
        batch.update(reportRef, updates);
      });
      await batch.commit();
    } catch (error) {
      console.error('Error bulk updating reports:', error);
    }
  };

  const getReportsByStatus = (status: ReportStatus) => reports.filter(r => r.status === status);

  const getBestAvailableStaff = (): StaffMember | null => {
    const available = staff.filter(s => s.active && s.activeTasks < s.maxTasks);
    if (available.length === 0) return null;
    return available.sort((a, b) => {
      const workloadA = a.activeTasks / a.maxTasks;
      const workloadB = b.activeTasks / b.maxTasks;
      if (workloadA !== workloadB) return workloadA - workloadB;
      return b.rating - a.rating;
    })[0];
  };

  const value = useMemo(() => ({
    reports, staff, addReport, updateReport, bulkUpdateReports, getReportsByStatus, getBestAvailableStaff, isLoading,
  }), [reports, staff, isLoading]);

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be used within ReportsProvider');
  return ctx;
}
