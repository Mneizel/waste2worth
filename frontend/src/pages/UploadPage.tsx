import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/Feedback';
import { Header } from '../components/Header';
import { Bottle, UploadCloud } from '../components/icons';
import { SpeakButton } from '../components/SpeakButton';
import { CATEGORIES } from '../data/categories';
import { ApiError, api } from '../lib/api';
import './UploadPage.css';

const HEADING = 'صوّر أو ارفع صورة القنينة';
const SUBTITLE = 'صوّر أو ارفع صورة قنينة، ومنوريك كيف تعيد تدويرها خطوة بخطوة.';

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
          : 'ما قدرنا نحلّل الصورة. جرّب مرة ثانية.',
      );
      setBusy(false);
    }
  }

  return (
    <div className="app-shell page-enter">
      <Header step={1} />

      <div className="stack" style={{ gap: 10, marginBottom: 18 }}>
        <div className="page-title-row">
          <h1 style={{ fontSize: '1.6rem' }}>{HEADING}</h1>
          <SpeakButton text={`${HEADING}. ${SUBTITLE}`} label="اسمع الشرح" />
        </div>
        <p className="sub" style={{ fontSize: '0.95rem' }}>{SUBTITLE}</p>
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
              <div className="sub">أو اضغط لاختيار صورة من جهازك</div>
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
            {busy ? 'جارٍ التحليل…' : 'حلّل الصورة'}
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

      <div className="cats">
        <div className="page-title-row">
          <h2 className="cats__h2">الأشياء اللي بيغطّيها التطبيق</h2>
          <SpeakButton
            text={`الأشياء اللي بيغطّيها التطبيق. متوفّر هلق: ${CATEGORIES.filter((c) => c.status === 'available')
              .map((c) => c.label)
              .join('، ')}. وجايي قريباً: ${CATEGORIES.filter((c) => c.status === 'soon')
              .map((c) => c.label)
              .join('، ')}.`}
            label="اسمع الفئات"
            size="sm"
          />
        </div>
        <div className="cats__grid">
          {CATEGORIES.map((c) => (
            <div key={c.key} className={`cat-chip cat-chip--${c.status}`}>
              <span className="cat-chip__label">{c.label}</span>
              <span className="cat-chip__badge">
                {c.status === 'available' ? 'متوفّر' : 'قريباً'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
