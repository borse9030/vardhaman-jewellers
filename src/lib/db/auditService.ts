import { AuditLog } from '@/types';

let memoryAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    action: 'Gold Rate Morning Benchmark Update',
    category: 'GoldRate',
    performedBy: 'jaynam27@gmail.com',
    details: 'Updated 24K: ₹7,380/g, 22K: ₹6,765/g, 18K: ₹5,535/g, Silver: ₹89/g',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'log-2',
    action: 'Catalogue Verification',
    category: 'Product',
    performedBy: 'jaynam27@gmail.com',
    details: 'Verified BIS 916 hallmarking certifications for Khandesh Royal Heritage collection',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export async function getAuditLogs(): Promise<AuditLog[]> {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('vj_audit_logs');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryAuditLogs = parsed;
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse audit logs:', e);
      }
    }
  }
  return memoryAuditLogs;
}

export async function addAuditLog(
  action: string,
  category: AuditLog['category'],
  performedBy: string,
  details: string
): Promise<AuditLog> {
  const all = await getAuditLogs();
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    action,
    category,
    performedBy,
    details,
    timestamp: new Date().toISOString(),
  };
  all.unshift(newLog);
  memoryAuditLogs = all;
  if (typeof window !== 'undefined') {
    localStorage.setItem('vj_audit_logs', JSON.stringify(all.slice(0, 100)));
  }
  return newLog;
}
