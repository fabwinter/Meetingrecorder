import { chunkTranscript } from '../../supabase/functions/summarize/index';

test('chunkTranscript splits long strings', () => {
  const txt = 'a'.repeat(25000);
  const chunks = chunkTranscript(txt, 12000);
  expect(chunks.length).toBe(3);
});