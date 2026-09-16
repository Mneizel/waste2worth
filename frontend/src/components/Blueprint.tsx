import { renderBlueprint as renderBottleBlueprint, type BlueprintOpts } from './blueprintSvg';
import './Blueprint.css';
import { renderBlueprint as renderCanBlueprint } from './canSvg';

type Props = BlueprintOpts & { categoryKey: string };

/** Dispatches to the right category's blueprint engine — see
 * docs/adding-a-category.md for how a new category plugs in here. */
export function Blueprint({ categoryKey, ...opts }: Props) {
  const html = categoryKey === 'can' ? renderCanBlueprint(opts) : renderBottleBlueprint(opts);
  return (
    <div
      className="bp"
      // our own generated markup, no user input
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
