import { Client, Session } from '../types';

export interface SignUpRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  poid?: string;
  taille?: string;
  goal?: string;
  message: string;
  subscriptionType?: string;
  paymentMethod?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AppDataExport {
  version: 1;
  exportedAt: string;
  clients: Client[];
  sessions: Session[];
  signup_requests: SignUpRequest[];
}

const STORAGE_KEYS = ['coach_clients', 'coach_sessions', 'signup_requests'] as const;

export function exportAllData(): AppDataExport {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    clients: JSON.parse(localStorage.getItem('coach_clients') || '[]'),
    sessions: JSON.parse(localStorage.getItem('coach_sessions') || '[]'),
    signup_requests: JSON.parse(localStorage.getItem('signup_requests') || '[]'),
  };
}

export function downloadDataBackup(): void {
  const data = exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `coach-aymen-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAllData(file: File): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as Partial<AppDataExport>;
        if (!data.clients || !data.sessions || !data.signup_requests) {
          resolve({ success: false, message: 'Fichier invalide : données manquantes.' });
          return;
        }
        localStorage.setItem('coach_clients', JSON.stringify(data.clients));
        localStorage.setItem('coach_sessions', JSON.stringify(data.sessions));
        localStorage.setItem('signup_requests', JSON.stringify(data.signup_requests));
        resolve({ success: true, message: 'Données importées avec succès. Rechargement...' });
      } catch {
        resolve({ success: false, message: 'Fichier JSON invalide.' });
      }
    };
    reader.onerror = () => resolve({ success: false, message: 'Erreur de lecture du fichier.' });
    reader.readAsText(file);
  });
}

export function clearAllAppData(): void {
  STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}
