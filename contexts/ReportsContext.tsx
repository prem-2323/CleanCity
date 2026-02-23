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
  writeBatch,
  getDocs
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
  isWaste?: boolean;
  severityScore?: number;
  detectedObjects?: string[];
  modelTrace?: string[];
  cleanupVerification?: {
    verified: boolean;
    similarityScore: number;
    cleanupScore: number;
    checkedAt: string;
  };
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
  addReport: (report: Omit<Report, 'id'>) => Promise<string | null>;
  updateReport: (id: string, updates: Partial<Report>) => Promise<void>;
  bulkUpdateReports: (ids: string[], updates: Partial<Report>) => Promise<void>;
  getReportsByStatus: (status: ReportStatus) => Report[];
  getBestAvailableStaff: () => StaffMember | null;
  isLoading: boolean;
}

const ReportsContext = createContext<ReportsContextValue | null>(null);

const SEED_STAFF: Omit<StaffMember, 'id'>[] = [
  { name: 'Ravi Kumar', rating: 4.8, tasksCompleted: 47, activeTasks: 1, maxTasks: 5, zone: 'North Zone', active: true },
  { name: 'Priya Sharma', rating: 4.6, tasksCompleted: 38, activeTasks: 0, maxTasks: 5, zone: 'South Zone', active: true },
  { name: 'Amit Singh', rating: 4.9, tasksCompleted: 62, activeTasks: 2, maxTasks: 5, zone: 'East Zone', active: true },
  { name: 'Neha Patel', rating: 4.5, tasksCompleted: 29, activeTasks: 0, maxTasks: 4, zone: 'West Zone', active: true },
  { name: 'Suresh Yadav', rating: 4.3, tasksCompleted: 15, activeTasks: 1, maxTasks: 4, zone: 'Central Zone', active: true },
];

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

        // Seed staff collection if empty
        if (staffData.length === 0) {
          seedStaffCollection();
        }
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

  const seedStaffCollection = async () => {
    try {
      const existing = await getDocs(collection(db, 'staff'));
      if (existing.size > 0) return;
      const batch = writeBatch(db);
      SEED_STAFF.forEach((s) => {
        const ref = doc(collection(db, 'staff'));
        batch.set(ref, s);
      });
      await batch.commit();
      console.log('Seeded staff collection with', SEED_STAFF.length, 'members');
    } catch (error) {
      console.error('Error seeding staff:', error);
    }
  };

  useEffect(() => {
    if (reportsLoaded && staffLoaded) {
      setIsLoading(false);
    }
  }, [reportsLoaded, staffLoaded]);

  const addReport = async (report: Omit<Report, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'reports'), {
        ...report,
        createdAt: new Date().toISOString()
      });

      // Auto-assign to best available staff based on priority
      const bestStaff = getBestAvailableStaff();
      if (bestStaff) {
        await updateDoc(doc(db, 'reports', docRef.id), {
          status: 'assigned',
          assignedTo: bestStaff.id,
        });
        // Increment staff active tasks
        await updateDoc(doc(db, 'staff', bestStaff.id), {
          activeTasks: bestStaff.activeTasks + 1,
        });
      }

      return docRef.id;
    } catch (error) {
      console.error('Error adding report:', error);
      return null;
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
