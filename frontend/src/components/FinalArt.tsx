import { renderFinalArt as renderBottleFinalArt, type FinalArtOpts } from './blueprintSvg';
import './Blueprint.css';
import { renderFinalArt as renderCanFinalArt } from './canSvg';

type Props = FinalArtOpts & { categoryKey: string };

/** The finished product, rendered from the same workpiece model as the step
 * blueprints — so it always matches what the steps actually build. Dispatches
 * to the right category's engine (see docs/adding-a-category.md). */
export function FinalArt({ categoryKey, ...opts }: Props) {
  const html = categoryKey === 'can' ? renderCanFinalArt(opts) : renderBottleFinalArt(opts);
  return (
    <div
      className="bp"
      // our own generated markup, no user input
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
