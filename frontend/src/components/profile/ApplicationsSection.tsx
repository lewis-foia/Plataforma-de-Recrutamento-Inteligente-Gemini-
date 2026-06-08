import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Briefcase, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

export default function ApplicationsSection() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/applications/mine').then(r => setApps(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <Spinner />;
  if (!apps.length) return <div className="text-center py-8 text-gray-500">Nenhuma candidatura ainda.</div>;

  const statusMap: any = { PENDING: { label: 'Pendente', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' }, REVIEWED: { label: 'Em Análise', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' }, APPROVED: { label: 'Aprovada', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' }, REJECTED: { label: 'Rejeitada', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' } };

  return (<div className="space-y-3">{apps.map(app => { const cfg = statusMap[app.status] || statusMap.PENDING; const Icon = cfg.icon; return (<div key={app.id} className="bg-gray-50 rounded-xl border border-gray-200 p-3 flex justify-between items-center"><div><div className="flex items-center gap-2"><Briefcase size={14} className="text-gray-500"/><span className="font-medium">{app.job_title || `Vaga ${app.job_id.slice(0,8)}`}</span></div><div className="flex items-center gap-1 text-xs text-gray-400 mt-1"><Calendar size={10}/>{new Date(app.applied_at).toLocaleDateString()}</div></div><span className={`px-2 py-0.5 rounded-full text-xs ${cfg.bg} ${cfg.color}`}><Icon size={10} className="inline mr-1"/>{cfg.label}</span></div>); })}</div>);
}