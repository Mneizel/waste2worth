import { renderBlueprint, type BlueprintOpts } from './blueprintSvg';
import './Blueprint.css';

export function Blueprint(props: BlueprintOpts) {
  return (
    <div
      className="bp"
      // our own generated markup, no user input
      dangerouslySetInnerHTML={{ __html: renderBlueprint(props) }}
    />
  );
}
