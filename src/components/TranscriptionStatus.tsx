import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Check, DollarSign, Mic, FileAudio } from "lucide-react";
import { TranscriptionStatus as Status } from "@/hooks/useTranscriptionService";

interface TranscriptionStatusProps {
  status: Status;
  progress: number;
  error: string | null;
  estimatedCost: { cost: number; currency: string } | null;
  source: "recording" | "upload";
}

export const TranscriptionStatus = ({
  status,
  progress,
  error,
  estimatedCost,
  source
}: TranscriptionStatusProps) => {
  const getStatusText = (): string => {
    switch (status) {
      case Status.Preparing:
        return "Preparing audio...";
      case Status.Transcribing:
        return "Transcribing audio...";
      case Status.Summarizing:
        return "Generating summary...";
      case Status.Complete:
        return "Processing complete!";
      case Status.Error:
        return "Processing failed";
      default:
        return "";
    }
  };

  const getIcon = () => {
    switch (status) {
      case Status.Complete:
        return <Check className="text-white" size={32} />;
      case Status.Error:
        return <AlertCircle className="text-white" size={32} />;
      case Status.Idle:
        return source === "recording" ? <Mic className="text-primary" size={32} /> : <FileAudio className="text-primary" size={32} />;
      default:
        return <Loader2 className="text-white animate-spin" size={32} />;
    }
  };

  const getStatusColor = (): string => {
    switch (status) {
      case Status.Complete:
        return "bg-green-500";
      case Status.Error:
        return "bg-destructive";
      case Status.Idle:
        return "bg-muted";
      default:
        return "bg-amber-500";
    }
  };

  // Fix: Only render component when status isn't Idle
  if (status === Status.Idle) {
    return null;
  }

  return (
    <div className="w-full max-w-xs space-y-4">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor()}`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="font-medium">{getStatusText()}</p>
          {estimatedCost && status !== Status.Error && status !== Status.Complete && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign size={12} />
              Estimated cost: {estimatedCost.cost} {estimatedCost.currency}
            </p>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status !== Status.Complete && status !== Status.Error && (
        <div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-right">{Math.round(progress)}%</p>
        </div>
      )}
    </div>
  );
};
