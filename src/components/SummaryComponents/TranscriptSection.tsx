
import React from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface TranscriptSectionProps {
  transcription: string | null;
  audioUrl: string | null;
  isEditing: boolean;
  onTranscriptionChange: (text: string) => void;
}

export const TranscriptSection = ({
  transcription,
  audioUrl,
  isEditing,
  onTranscriptionChange,
}: TranscriptSectionProps) => {
  const { toast } = useToast();

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(transcription || "");
    toast({
      title: "Copied",
      description: "Transcript copied to clipboard",
    });
  };

  return (
    <>
      <section className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Full Transcript</h3>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
              onClick={handleCopyTranscript}
            >
              <Copy size={14} />
              <span>Copy</span>
            </Button>
          ) : null}
        </div>
        {!isEditing ? (
          <div className="p-4 bg-muted/30 rounded-md whitespace-pre-wrap">
            {transcription || "Transcript not available."}
          </div>
        ) : (
          <Textarea
            value={transcription || ""}
            onChange={(e) => onTranscriptionChange(e.target.value)}
            className="min-h-[200px]"
          />
        )}
      </section>

      {audioUrl && (
        <section className="mb-6">
          <h3 className="text-lg font-medium mb-3">Audio Recording</h3>
          <div className="bg-muted/30 p-4 rounded-md">
            <audio src={audioUrl} controls className="w-full" />
          </div>
        </section>
      )}
    </>
  );
};
