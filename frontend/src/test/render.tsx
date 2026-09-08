import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

import App from '../App';

type Entry = string | { pathname: string; state?: unknown };

/** Render the whole app at a route, with a user-event instance. */
export function renderApp(entry: Entry = '/') {
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={[entry as never]}>
      <App />
    </MemoryRouter>,
  );
  return { user, ...utils };
}

/** Render an isolated element inside a router (for single components). */
export function renderInRouter(ui: ReactElement, entry: Entry = '/') {
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={[entry as never]}>{ui}</MemoryRouter>,
  );
  return { user, ...utils };
}

/** A small fake image file for upload inputs. */
export function imageFile(name = 'bottle.png', type = 'image/png'): File {
  return new File([new Uint8Array([1, 2, 3, 4])], name, { type });
}
