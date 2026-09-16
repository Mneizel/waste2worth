import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Blueprint } from '../components/Blueprint';
import { Button } from '../components/Button';
import { ErrorBanner, Loading } from '../components/Feedback';
import { FinalArt } from '../components/FinalArt';
import { Header } from '../components/Header';
import { Model3DView } from '../components/Model3DView';
import { ArrowNext, Lightbulb, Ruler, Warning, toolIcon } from '../components/icons';
import { SpeakButton } from '../components/SpeakButton';
import { compute as computeCan, type CanMeasureId } from '../data/canMeasure';
import { VARIANTS } from '../data/catalogue';
import { compute as computeBottle, type MeasureId } from '../data/measure';
import { ApiError, api } from '../lib/api';
import type { IdeaDetail, Variant } from '../lib/types';
import { useScan } from '../lib/useScan';
import './GuidePage.css';

// A sensible default so the guide still renders on a direct link.
const DEFAULT_VARIANT = VARIANTS.find(
  (v) => v.key === 'pet-water-500ml',
) as Variant;

const CATEGORY_ITEM_LABEL_AR: Record<string, string> = {
  bottle: 'قنينتك',
  can: 'علبتك',
};

/** Dispatches to the right category's measure module — see
 * docs/adding-a-category.md for how a new category plugs in here. */
function computeMeasure(categoryKey: string, measure: string, variant: Variant) {
  return categoryKey === 'can'
    ? computeCan(measure as CanMeasureId, variant)
    : computeBottle(measure as MeasureId, variant);
}

export function GuidePage() {
  // The route always supplies :scanId and :ideaId.
  const { scanId, ideaId } = useParams() as { scanId: string; ideaId: string };
  const navigate = useNavigate();
  const { scan } = useScan(scanId);

  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const detail = await api.getIdea(ideaId);
      setIdea(detail);
      void api.selectIdea(scanId, ideaId).catch(() => undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذّر تحميل الدليل.');
    }
  }, [ideaId, scanId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <div className="app-shell">
        <Header step={4} />
        <ErrorBanner message={error} onRetry={load} />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="app-shell">
        <Header step={4} />
        <Loading label="عم نحضّر الخطوات…" />
      </div>
    );
  }

  const variant = scan?.confirmedVariant ?? DEFAULT_VARIANT;
  const categoryKey = variant.categoryKey;
  const tools = idea.tools.filter((t) => t.kind === 'tool');
  const materials = idea.tools.filter((t) => t.kind === 'material');

  // The blueprint is stateful: every step needs the whole project's op list so
  // it can draw the workpiece as it stands after all the earlier steps.
  const stepOps = idea.steps.map((s) => s.op);
  const stepFracs = idea.steps.map((s) =>
    s.measure ? computeMeasure(categoryKey, s.measure, variant).frac ?? null : null,
  );

  return (
    <div className="app-shell page-enter">
      <Header step={4} />

      <button className="gd__back" onClick={() => navigate(-1)}>
        رجوع للأفكار
      </button>

      <div className="gd__hero">
        <div className="gd__hero-art">
          <FinalArt categoryKey={categoryKey} ops={stepOps} fracs={stepFracs} variant={variant} title={idea.title} />
        </div>
        <div className="stack" style={{ gap: 6 }}>
          <div className="page-title-row">
            <h1 style={{ fontSize: '1.5rem' }}>{idea.title}</h1>
            <SpeakButton
              text={`${idea.title}. ${idea.summary} بتاخد حوالي ${idea.estimatedMinutes} دقيقة، مستوى ${difficultyAr(idea.difficulty)}، من عمر ${idea.minAge} سنين وفوق.`}
              label="اسمع الشرح"
            />
          </div>
          <p className="sub" style={{ fontSize: '0.95rem' }}>{idea.summary}</p>
          <div className="gd__tags">
            <span>{idea.estimatedMinutes} دقيقة</span>
            <span>{difficultyAr(idea.difficulty)}</span>
            <span>من عمر {idea.minAge}+</span>
          </div>
        </div>
      </div>

      <p className="gd__bottle">
        <Ruler size={16} /> المقاسات محسوبة لـ{CATEGORY_ITEM_LABEL_AR[categoryKey]}:{' '}
        {variant.label} — ارتفاع{' '}
        {toArabicDigits(variant.heightMm)} ملم، قطر{' '}
        {toArabicDigits(variant.diameterMm)} ملم.
      </p>

      {idea.safetyNotes && (
        <div className="gd__safety">
          <Warning size={20} />
          <span>{idea.safetyNotes}</span>
        </div>
      )}

      {idea.source && (
        <p className="gd__source">الطريقة والقياسات مبنيّة على: {idea.source}</p>
      )}

      <section className="gd__section">
        <div className="page-title-row">
          <h2 className="gd__h2">١ · الأدوات والمواد اللي بتحتاجها</h2>
          <SpeakButton
            text={`الأدوات والمواد اللي بتحتاجها: ${[...tools, ...materials].map((t) => t.name).join('، ')}.`}
            label="اسمع الأدوات"
            size="sm"
          />
        </div>
        <div className="gd__tools">
          {[...tools, ...materials].map((t) => {
            const Icon = toolIcon(t.name);
            return (
              <div key={t.id} className="tool">
                <span className="tool__icon">
                  <Icon size={24} />
                </span>
                <span className="tool__name">{t.name}</span>
                <span className="tool__qty">
                  {t.quantity}
                  {t.optional ? ' · اختياري' : ''}
                </span>
                {t.note && <span className="tool__note">{t.note}</span>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="gd__section">
        <h2 className="gd__h2">٢ · الخطوات</h2>
        <ol className="gd__steps">
          {idea.steps.map((s, idx) => {
            const m = s.measure ? computeMeasure(categoryKey, s.measure, variant) : null;
            return (
              <li key={s.stepNumber} className="step">
                <div className="step__num">{toArabicDigits(s.stepNumber)}</div>
                <div className="step__body">
                  <div className="step__blueprint">
                    <Blueprint
                      categoryKey={categoryKey}
                      ops={stepOps}
                      fracs={stepFracs}
                      index={idx}
                      title={s.title}
                      project={idea.title}
                      variant={variant}
                      instruction={s.instruction}
                      measureSentence={m?.sentence}
                      measureShort={m?.short}
                      tip={s.tip || undefined}
                      warning={s.warning || undefined}
                    />
                  </div>
                  <div className="step__text">
                    <div className="step__title-row">
                      <div className="step__title">{s.title}</div>
                      <SpeakButton
                        text={[s.title, s.instruction, m?.sentence, s.tip, s.warning]
                          .filter(Boolean)
                          .join('. ')}
                        label={`اسمع الخطوة ${toArabicDigits(s.stepNumber)}`}
                        size="sm"
                      />
                    </div>
                    <p className="step__instruction">{s.instruction}</p>
                    {m && (
                      <div className="step__hint step__hint--measure">
                        <Ruler size={16} />
                        <span>{m.sentence}</span>
                      </div>
                    )}
                    {s.tip && (
                      <div className="step__hint step__hint--tip">
                        <Lightbulb size={16} />
                        <span>{s.tip}</span>
                      </div>
                    )}
                    {s.warning && (
                      <div className="step__hint step__hint--warn">
                        <Warning size={16} />
                        <span>{s.warning}</span>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="gd__section">
        <h2 className="gd__h2">٣ · قارن مع النموذج ثلاثي الأبعاد</h2>
        <Model3DView
          front={
            <FinalArt categoryKey={categoryKey} ops={stepOps} fracs={stepFracs} variant={variant} title={idea.title} />
          }
          title={idea.title}
        />
      </section>

      <Button block onClick={() => navigate('/')}>
        خلّصت! جرّب غرض تاني <ArrowNext size={18} />
      </Button>
    </div>
  );
}

function difficultyAr(d: IdeaDetail['difficulty']): string {
  return d === 'easy' ? 'سهل' : d === 'medium' ? 'متوسط' : 'متقدّم';
}

function toArabicDigits(n: number): string {
  return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
}
