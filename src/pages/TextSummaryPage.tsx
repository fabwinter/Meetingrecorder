import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateSummary } from '@/services/summaryService';

export default function TextSummaryPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [length, setLength] = useState<'brief' | 'detailed'>('brief');
  const [includeActions, setIncludeActions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please paste a transcript first.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await generateSummary(text, { length, actionItems: includeActions });
      setSummary(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">AI Meeting Summarizer</h1>
      <Textarea
        className="mb-3 min-h-[160px]"
        placeholder="Paste your meeting transcript..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="length">Summary length</Label>
          <Select
            value={length}
            onValueChange={(v) => setLength(v as 'brief' | 'detailed')}
          >
            <SelectTrigger id="length" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brief">Brief</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="actions"
            checked={includeActions}
            onCheckedChange={(v) => setIncludeActions(!!v)}
          />
          <Label htmlFor="actions">Include action items</Label>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Summarizing...' : 'Generate Summary'}
      </Button>

      {error && <p className="mt-3 text-destructive">{error}</p>}

      {summary && (
        <div className="mt-6 rounded-md border p-4">
          <h2 className="mb-2 text-lg font-medium">Summary</h2>
          <pre className="whitespace-pre-wrap text-sm">{summary}</pre>
        </div>
      )}
    </div>
  );
}