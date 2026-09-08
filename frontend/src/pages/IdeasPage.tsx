import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '../components/Button';
import { ErrorBanner, Loading } from '../components/Feedback';
import { Header } from '../components/Header';
import { Lightbulb } from '../components/icons';
import { ApiError, api, mediaUrl } from '../lib/api';
import type { IdeaSummary } from '../lib/types';
import './IdeasPage.css';

export function IdeasPage() {
  // The route always supplies :scanId.
  const scanId = useParams().scanId as string;
  const navigate = useNavigate();

  const [ideas, setIdeas] = useState<IdeaSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setIdeas(await api.scanIdeas(scanId));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'تعذّر تحميل الأفكار. تأكد إنه الـ backend شغّال.',
      );
    }
  }, [scanId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="app-shell page-enter">
      <Header step={3} />

      <div className="stack" style={{ gap: 8, marginBottom: 18 }}>
        <h1 style={{ fontSize: '1.5rem' }}>
          <Lightbulb size={22} style={{ verticalAlign: '-4px', marginInlineEnd: 6 }} />
          أفكار لإعادة التدوير
        </h1>
        <p className="sub" style={{ fontSize: '0.95rem' }}>
          اختَر فكرة تعجبك وبنوريك الطريقة خطوة بخطوة.
        </p>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {!error && !ideas && <Loading label="عم نجيب الأفكار…" />}

      {ideas && ideas.length === 0 && (
        <div className="stack" style={{ gap: 14 }}>
          <p>ما في أفكار محفوظة لهذا الحجم بعد.</p>
          <Button variant="ghost" onClick={() => navigate('/')}>
            ابدأ من جديد
          </Button>
        </div>
      )}

      {ideas && ideas.length > 0 && (
        <div className="ideas-grid">
          {ideas.map((idea) => (
            <button
              key={idea.id}
              className="idea"
              onClick={() =>
                navigate(`/scan/${scanId}/idea/${idea.id}`, { state: { scanId } })
              }
            >
              <div className="idea__img">
                <img
                  src={mediaUrl(idea.finalImageUrl)}
                  alt={idea.title}
                  loading="lazy"
                />
              </div>
              <div className="idea__name">{idea.title}</div>
              <div className="idea__meta">
                {idea.estimatedMinutes} دقيقة · {difficultyAr(idea.difficulty)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function difficultyAr(d: IdeaSummary['difficulty']): string {
  return d === 'easy' ? 'سهل' : d === 'medium' ? 'متوسط' : 'متقدّم';
}
