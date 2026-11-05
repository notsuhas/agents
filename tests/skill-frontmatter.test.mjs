import test from 'node:test';
import assert from 'node:assert/strict';
import { quoteUnquotedColonScalars } from '../scripts/lib/quote-frontmatter-colon-scalars.mjs';

const colonDescription =
  'name: software-factory\n' +
  'description: Shared language for designing a software factory: the tasks it runs and the services it plugs into.\n' +
  'disable-model-invocation: true';

test('quoteUnquotedColonScalars quotes descriptions with colons', () => {
  const fixed = quoteUnquotedColonScalars(colonDescription);
  assert.match(
    fixed,
    /description: "Shared language for designing a software factory: the tasks it runs and the services it plugs into\."/,
  );
  assert.match(fixed, /^name: software-factory$/m);
  assert.match(fixed, /^disable-model-invocation: true$/m);
});

test('quoteUnquotedColonScalars leaves quoted and block scalars alone', () => {
  const header =
    'name: example\n' +
    'description: "already: quoted"\n' +
    'note: |\n  line one: detail\n';
  assert.equal(quoteUnquotedColonScalars(header), header);
});
