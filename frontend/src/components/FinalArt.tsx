import { renderFinalArt, type FinalArtOpts } from './blueprintSvg';
import './Blueprint.css';

/** The finished product, rendered from the same workpiece model as the step
 * blueprints — so it always matches what the steps actually build. */
export function FinalArt(props: FinalArtOpts) {
  return (
    <div
      className="bp"
      // our own generated markup, no user input
      dangerouslySetInnerHTML={{ __html: renderFinalArt(props) }}
    />
  );
}
