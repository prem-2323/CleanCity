import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReportStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved';
export type ReportPriority = 'low' | 'medium' | 'high' | 'critical';
export type WasteType = 'plastic' | 'organic' | 'hazardous' | 'electronic' | 'mixed';

export interface Report {
  id: string;
  title: string;
  description: string;
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
  zone: string;
}

interface ReportsContextValue {
  reports: Report[];
  staff: StaffMember[];
  addReport: (report: Report) => Promise<void>;
  updateReport: (id: string, updates: Partial<Report>) => Promise<void>;
  getReportsByStatus: (status: ReportStatus) => Report[];
  isLoading: boolean;
}

const ReportsContext = createContext<ReportsContextValue | null>(null);

const SAMPLE_STAFF: StaffMember[] = [
  { id: '1', name: 'Arjun Patel', rating: 4.8, tasksCompleted: 142, activeTasks: 3, zone: 'Zone A' },
  { id: '2', name: 'Priya Sharma', rating: 4.6, tasksCompleted: 128, activeTasks: 2, zone: 'Zone B' },
  { id: '3', name: 'Rahul Kumar', rating: 4.9, tasksCompleted: 167, activeTasks: 1, zone: 'Zone A' },
  { id: '4', name: 'Sneha Reddy', rating: 4.5, tasksCompleted: 95, activeTasks: 4, zone: 'Zone C' },
  { id: '5', name: 'Vikram Singh', rating: 4.7, tasksCompleted: 110, activeTasks: 2, zone: 'Zone B' },
];

const SAMPLE_REPORTS: Report[] = [
  {
    id: '1', title: 'Plastic waste near park', description: 'Large pile of plastic bags and bottles',
    wasteType: 'plastic', status: 'pending', priority: 'high', latitude: 28.6139, longitude: 77.2090,
    address: 'Central Park, Sector 12', createdAt: '2026-02-17T10:30:00Z', aiConfidence: 94, creditsEarned: 25,
  },
  {
    id: '2', title: 'Electronic waste dump', description: 'Old monitors and keyboards discarded',
    wasteType: 'electronic', status: 'assigned', priority: 'critical', latitude: 28.6200, longitude: 77.2150,
    address: 'Industrial Area, Block C', createdAt: '2026-02-16T14:00:00Z', assignedTo: '1', aiConfidence: 89, creditsEarned: 40,
  },
  {
    id: '3', title: 'Organic waste overflow', description: 'Garbage bin overflowing with food waste',
    wasteType: 'organic', status: 'in_progress', priority: 'medium', latitude: 28.6100, longitude: 77.2050,
    address: 'Market Road, Lane 4', createdAt: '2026-02-15T09:00:00Z', assignedTo: '3', aiConfidence: 97, creditsEarned: 15,
  },
  {
    id: '4', title: 'Hazardous chemical containers', description: 'Paint cans and chemical bottles',
    wasteType: 'hazardous', status: 'resolved', priority: 'critical', latitude: 28.6180, longitude: 77.2120,
    address: 'Factory Road, Sector 8', createdAt: '2026-02-14T16:45:00Z', assignedTo: '2', aiConfidence: 91, creditsEarned: 50,
  },
  {
    id: '5', title: 'Mixed waste on sidewalk', description: 'Various waste materials blocking walkway',
    wasteType: 'mixed', status: 'pending', priority: 'low', latitude: 28.6150, longitude: 77.2080,
    address: 'Residential Block, Sector 15', createdAt: '2026-02-13T11:20:00Z', aiConfidence: 85, creditsEarned: 10,
  },
];

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const stored = await AsyncStorage.getItem('reports');
      if (stored) {
        setReports(JSON.parse(stored));
      } else {
        setReports(SAMPLE_REPORTS);
        await AsyncStorage.setItem('reports', JSON.stringify(SAMPLE_REPORTS));
      }
    } catch {
      setReports(SAMPLE_REPORTS);
    }
    setIsLoading(false);
  };

  const addReport = async (report: Report) => {
    const updated = [report, ...reports];
    setReports(updated);
    await AsyncStorage.setItem('reports', JSON.stringify(updated));
  };

  const updateReport = async (id: string, updates: Partial<Report>) => {
    const updated = reports.map(r => r.id === id ? { ...r, ...updates } : r);
    setReports(updated);
    await AsyncStorage.setItem('reports', JSON.stringify(updated));
  };

  const getReportsByStatus = (status: ReportStatus) => reports.filter(r => r.status === status);

  const value = useMemo(() => ({
    reports, staff: SAMPLE_STAFF, addReport, updateReport, getReportsByStatus, isLoading,
  }), [reports, isLoading]);

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be used within ReportsProvider');
  return ctx;
}
