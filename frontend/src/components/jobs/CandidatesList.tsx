import { useJobStore } from '@/store/jobStore';
import { User, TrendingUp } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

export default function CandidatesList({ jobId }: { jobId: string }) {
  const { candidates, isLoading } = useJobStore();

  if (isLoading) return <Spinner centered text="A carregar candidatos..." />;
  if (candidates.length === 0) return <div className="text-center py-8 text-gray-500">Nenhum candidato ainda.</div>;

  return (
    <div className="space-y-4">
      {candidates.map((c, i) => {
        const score = c.compatibility_score;
        const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';
        const barColor = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
        return (
          <div key={c.application_id} className="bg-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-sm transition">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">{i+1}</div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2"><User size={14} className="text-gray-500" /><h3 className="font-semibold text-gray-800">{c.candidate_name || `Candidato ${c.candidate_id.slice(0,8)}`}</h3>{i < 3 && <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>}</div>
                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><TrendingUp size={14} className={scoreColor} /><span className={`font-bold ${scoreColor}`}>{score}%</span></div>
                </div>
                <div className="mt-2"><div className="flex justify-between text-xs text-gray-500 mb-1"><span>Compatibilidade</span><span>{score}%</span></div><div className="w-full bg-gray-200 rounded-full h-1.5"><div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${score}%` }} /></div></div>
                {c.justification && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{c.justification}</p>}
                {c.skills?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{c.skills.slice(0,4).map(s => <span key={s} className="bg-white text-xs px-2 py-0.5 rounded-full text-gray-600 border border-gray-200">{s}</span>)}</div>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}