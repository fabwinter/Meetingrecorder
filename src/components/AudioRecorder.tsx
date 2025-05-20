
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useTranscriptionService, TranscriptionStatus } from "@/hooks/useTranscriptionService";
import { TranscriptionStatus as StatusDisplay } from "@/components/TranscriptionStatus";
import { RecordingStatus } from "@/types/recording";
import { RecordingUI } from "./AudioRecorder/RecordingUI";
import { ActionButtons } from "./AudioRecorder/ActionButtons";
import { AudioPlayer } from "./AudioRecorder/AudioPlayer";
import { formatTime } from "./AudioRecorder/utils";

export const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>(RecordingStatus.IDLE);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    status: transcriptionStatus,
    progress,
    error: transcriptionError,
    processAudio,
    estimatedCost,
    estimateAudioCost
  } = useTranscriptionService();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      
      stopMediaTracks();
    };
  }, [audioURL]);

  const stopMediaTracks = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error("Error stopping media tracks:", error);
      }
    }
  };

  const requestMicrophoneAccess = async () => {
    try {
      setRecordingStatus(RecordingStatus.REQUESTING);
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      setRecordingStatus(RecordingStatus.IDLE);
      return stream;
    } catch (err) {
      console.error("Error accessing microphone:", err);
      
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError("Microphone access denied. Please allow microphone access in your browser settings.");
        } else if (err.name === 'NotFoundError') {
          setError("No microphone found. Please connect a microphone and try again.");
        } else {
          setError(`Microphone error: ${err.message}`);
        }
      } else {
        setError("An unexpected error occurred when accessing the microphone.");
      }
      
      setRecordingStatus(RecordingStatus.ERROR);
      toast({
        title: "Microphone access failed",
        description: "Unable to access your microphone",
        variant: "destructive",
      });
      
      return null;
    }
  };

  const startRecording = async () => {
    const stream = await requestMicrophoneAccess();
    if (!stream) return;
    
    audioChunksRef.current = [];
    
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/ogg'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        processRecording(audioBlob);
      };

      // Set a data available event every second for longer recordings
      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingStatus(RecordingStatus.RECORDING);
      
      toast({
        title: "Recording started",
        description: "Speak clearly for best results"
      });

      // Start timer
      setRecordingTime(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          // Auto-stop after 30 minutes
          if (prev >= 1800) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000) as unknown as number;
      
      // Update cost estimate as recording progresses
      estimateAudioCost(0);
      
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Failed to start recording. Please try again.");
      setRecordingStatus(RecordingStatus.ERROR);
      
      toast({
        title: "Recording error",
        description: "An error occurred while setting up recording.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setIsRecording(false);
      
      try {
        mediaRecorderRef.current.stop();
        
        // Stop all audio tracks
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        
        // Clear timer interval
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        
        toast({
          title: "Recording complete",
          description: `Recorded ${formatTime(recordingTime)}`,
        });
        
        // Update cost estimate based on final duration
        estimateAudioCost(recordingTime);
      } catch (err) {
        console.error("Error stopping recording:", err);
        setError("Failed to stop recording properly.");
        setRecordingStatus(RecordingStatus.ERROR);
      }
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    try {
      // Store the recording info
      sessionStorage.setItem("lastRecordingURL", audioURL || "");
      sessionStorage.setItem("recordingDuration", recordingTime.toString());
      
      // Process the audio with our transcription service
      await processAudio(audioBlob, recordingTime);
      
      // Navigate to summary after a brief pause
      setTimeout(() => {
        navigate("/summary");
      }, 1500);
    } catch (error) {
      console.error("Error processing recording:", error);
      // Error handling is already done in the hook
    }
  };

  const handleRetry = () => {
    setError(null);
    setRecordingStatus(RecordingStatus.IDLE);
    setAudioBlob(null);
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-medium mb-2">Record Meeting</h2>
        <p className="text-muted-foreground">
          Tap the mic to start recording your meeting
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Recording Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <RecordingUI 
        recordingStatus={recordingStatus}
        isRecording={isRecording}
        recordingTime={recordingTime}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
      />

      <StatusDisplay 
        status={transcriptionStatus}
        progress={progress}
        error={transcriptionError}
        estimatedCost={estimatedCost}
        source="recording"
      />

      <ActionButtons
        isRecording={isRecording}
        recordingStatus={recordingStatus}
        transcriptionStatus={transcriptionStatus}
        onStopRecording={stopRecording}
        onStartRecording={startRecording}
        onRetry={handleRetry}
      />

      {isRecording && (
        <p className="text-sm text-muted-foreground">
          Recording will automatically stop after 30 minutes
        </p>
      )}

      <AudioPlayer 
        audioURL={audioURL}
        visible={!!audioURL && transcriptionStatus === "idle" && !isRecording}
      />
    </div>
  );
};
