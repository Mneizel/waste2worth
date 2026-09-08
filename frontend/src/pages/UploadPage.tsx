import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/Feedback';
import { Header } from '../components/Header';
import { Bottle, UploadCloud } from '../components/icons';
import { ApiError, api } from '../lib/api';
import './UploadPage.css';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif';
const MAX_BYTES = 8 * 1024 * 1024;

export function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hint, setHint] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pick(next: File | undefined | null) {
    setError(null);
    if (!next) return;
    if (!next.type.startsWith('image/')) {
      setError('لازم تكون صورة (JPG أو PNG أو WEBP).');
      return;
    }
    if (next.size > MAX_BYTES) {
      setError('الصورة كبيرة كتير. الحد الأقصى 8 ميغابايت.');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
  }

  async function submit() {
    if (!file) {
      setError('اختَر صورة أول.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const scan = await api.createScan(file, hint);
      navigate(`/scan/${scan.id}/confirm`, { state: { scan } });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'ما قدرنا نرفع الصورة. تأكد إنه الـ backend شغّال.',
      );
      setBusy(false);
    }
  }

  return (
    <div className="app-shell page-enter">
      <Header step={1} />

      <div className="stack" style={{ gap: 10, marginBottom: 18 }}>
        <h1 style={{ fontSize: '1.6rem' }}>صوّر أو ارفع صورة القنينة</h1>
        <p className="sub" style={{ fontSize: '0.95rem' }}>
          Take or upload a photo of a bottle and we&apos;ll show you how to upcycle it.
        </p>
      </div>

      <Card>
        <div
          className={`drop ${dragging ? 'drop--over' : ''} ${file ? 'drop--has' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files[0]);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
        >
          {previewUrl ? (
            <img className="drop__preview" src={previewUrl} alt="الصورة المختارة" />
          ) : (
            <>
              <UploadCloud size={56} className="drop__icon" />
              <div className="drop__title">اسحب صورة القنينة هون</div>
              <div className="sub">Drag &amp; drop a photo — or click to choose a file</div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            hidden
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </div>

        {file && (
          <div className="drop__file">
            <Bottle size={18} />
            <span className="drop__file-name">{file.name}</span>
            <button
              className="drop__clear"
              onClick={() => {
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setFile(null);
                setPreviewUrl(null);
              }}
            >
              تغيير
            </button>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 14 }}>
            <ErrorBanner message={error} />
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <Button block loading={busy} onClick={submit}>
            {busy ? 'جارٍ التحليل…' : 'حلّل الصورة · Analyse'}
          </Button>
        </div>

        <button
          type="button"
          className="hint-toggle"
          onClick={() => setShowHint((v) => !v)}
        >
          {showHint ? '−' : '+'} وضع الاختبار (تلميح للحجم)
        </button>
        {showHint && (
          <div className="hint-box">
            <p className="sub" style={{ margin: '0 0 8px' }}>
              الذكاء الاصطناعي حالياً نموذج تجريبي. اكتب حجم لتثبيت النتيجة:{' '}
              <code>500</code>، <code>1.5l</code>، أو <code>none</code> ليتصرّف كأنه
              ما عرف الجسم.
            </p>
            <input
              className="hint-input"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="مثال: 500"
              dir="ltr"
            />
          </div>
        )}
      </Card>
    </div>
  );
}
