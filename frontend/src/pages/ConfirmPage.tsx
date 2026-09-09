import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBanner, Loading } from '../components/Feedback';
import { Header } from '../components/Header';
import { Bottle, Check, Cross, Ruler } from '../components/icons';
import { ApiError, api, mediaUrl } from '../lib/api';
import type { Variant } from '../lib/types';
import { useScan } from '../lib/useScan';
import './ConfirmPage.css';

type Mode = 'ask' | 'pick';

export function ConfirmPage() {
  // The route always supplies :scanId.
  const scanId = useParams().scanId as string;
  const navigate = useNavigate();
  const { scan, loading, error, reload } = useScan(scanId);

  const [mode, setMode] = useState<Mode>('ask');
  const [alternatives, setAlternatives] = useState<Variant[]>([]);
  const [allSizes, setAllSizes] = useState<Variant[] | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const guess = scan?.aiGuess;
  const recognised = Boolean(guess?.variant);

  useEffect(() => {
    if (scan && !recognised && mode === 'ask') setMode('pick');
  }, [scan, recognised, mode]);

  const confidencePct = useMemo(
    () => (guess?.confidence != null ? Math.round(guess.confidence * 100) : null),
    [guess],
  );

  function reportError(err: unknown) {
    setActionError(
      err instanceof ApiError ? err.message : 'صار خطأ، جرّب كمان مرة.',
    );
  }

  async function loadAllSizes() {
    setShowAll(true);
    try {
      setAllSizes(await api.bottleSizes());
    } catch {
      setAllSizes([]);
    }
  }

  async function onYes() {
    setBusy('yes');
    setActionError(null);
    try {
      await api.confirmScan(scanId);
      navigate(`/scan/${scanId}/ideas`);
    } catch (err) {
      reportError(err);
      setBusy(null);
    }
  }

  async function onNo() {
    setBusy('no');
    setActionError(null);
    try {
      const result = await api.rejectScan(scanId);
      setAlternatives(result.alternatives);
      setMode('pick');
    } catch (err) {
      reportError(err);
    } finally {
      setBusy(null);
    }
  }

  async function choose(variant: Variant) {
    setBusy(variant.id);
    setActionError(null);
    try {
      await api.selectVariant(scanId, variant.id);
      navigate(`/scan/${scanId}/ideas`);
    } catch (err) {
      reportError(err);
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Header step={2} />
        <Loading label="عم نحلّل الصورة…" />
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="app-shell">
        <Header step={2} />
        <ErrorBanner message={error ?? 'الجلسة غير موجودة.'} onRetry={reload} />
        <div style={{ marginTop: 16 }}>
          <Button variant="ghost" onClick={() => navigate('/')}>
            رجوع للبداية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell page-enter">
      <Header step={2} />

      <Card>
        <div className="cf__head">
          <div className="cf__photo">
            {scan.image.url ? (
              <img src={mediaUrl(scan.image.url)} alt="صورة القنينة" />
            ) : (
              <Bottle size={44} />
            )}
          </div>
          <div className="stack" style={{ gap: 6 }}>
            {recognised ? (
              <>
                <h1 style={{ fontSize: '1.35rem' }}>
                  هاي {scan.aiGuess.variant!.label}؟
                </h1>
                <div className="sub">
                  {scan.aiGuess.label}
                  {scan.aiGuess.estimatedVolumeMl
                    ? ` · ~${scan.aiGuess.estimatedVolumeMl} مل`
                    : ''}
                </div>
                {confidencePct != null && (
                  <div className="cf__conf" aria-label={`ثقة ${confidencePct}%`}>
                    <span style={{ width: `${confidencePct}%` }} />
                  </div>
                )}
              </>
            ) : (
              <>
                <h1 style={{ fontSize: '1.3rem' }}>ما قدرنا نتعرّف على الجسم</h1>
                <div className="sub">اختَر حجم القنينة من القائمة تحت.</div>
              </>
            )}
          </div>
        </div>

        {mode === 'ask' && recognised && (
          <div className="cf__actions">
            <Button block loading={busy === 'yes'} onClick={onYes}>
              <Check size={20} /> أيوا، صح
            </Button>
            <Button
              variant="ghost"
              block
              loading={busy === 'no'}
              onClick={onNo}
            >
              <Cross size={18} /> لأ، غلط
            </Button>
          </div>
        )}

        {mode === 'pick' && (
          <div className="cf__pick">
            <div className="cf__pick-title">
              <Ruler size={18} /> اختَر الحجم الصحيح
            </div>

            {alternatives.length > 0 && (
              <div className="cf__sizes">
                {alternatives.map((v) => (
                  <SizeChip
                    key={v.id}
                    variant={v}
                    busy={busy === v.id}
                    onClick={() => choose(v)}
                  />
                ))}
              </div>
            )}

            {!showAll ? (
              <button className="cf__more" onClick={loadAllSizes}>
                مش هدول؟ اعرض كل الأحجام
              </button>
            ) : (
              <div className="cf__sizes cf__sizes--all">
                {(allSizes ?? []).map((v) => (
                  <SizeChip
                    key={v.id}
                    variant={v}
                    busy={busy === v.id}
                    onClick={() => choose(v)}
                  />
                ))}
                {allSizes && allSizes.length === 0 && (
                  <span className="sub">لا توجد أحجام محفوظة.</span>
                )}
              </div>
            )}
          </div>
        )}

        {actionError && (
          <div style={{ marginTop: 14 }}>
            <ErrorBanner message={actionError} />
          </div>
        )}
      </Card>
    </div>
  );
}

const MATERIAL_AR: Record<string, string> = {
  PET: 'بلاستيك',
  HDPE: 'بلاستيك',
  GLASS: 'زجاج',
  ALUMINIUM: 'ألمنيوم',
};

function SizeChip({
  variant,
  busy,
  onClick,
}: {
  variant: Variant;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button className="chip" disabled={busy} onClick={onClick}>
      <span className="chip__vol">{variant.volumeMl} مل</span>
      <span className="chip__label">{variant.label}</span>
      <span className="chip__dim">
        {Math.round(variant.heightMm / 10)}×{Math.round(variant.diameterMm / 10)} سم ·{' '}
        {MATERIAL_AR[variant.materialType] ?? variant.materialType}
      </span>
    </button>
  );
}
