export const chunkTranscript = (text: string, charLimit = 12000): string[] => {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + charLimit, text.length);
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
};