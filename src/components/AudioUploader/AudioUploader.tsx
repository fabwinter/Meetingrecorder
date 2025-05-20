
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useTranscriptionService, TranscriptionStatus } from "@/hooks/useTranscriptionService";
import { TranscriptionStatus as StatusDisplay } from "@/components/TranscriptionStatus";
import { useTheme } from "@/components/ThemeProvider";
import { validateFile, estimateDuration } from './utils';
import { UploadIcon } from './UploadIcon';
import { FileSelection } from './FileSelection';
import { UploadProgress } from './UploadProgress';
import { UploadButton } from './UploadButton';

export const AudioUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, colorScheme } = useTheme();
  const isColoredMode = theme === "coloured";
  const isYellowTheme = colorScheme === "yellow";
  
  const {
    status,
    progress,
    error,
    processAudio,
    estimatedCost,
    estimateAudioCost,
    hasValidApiKey
  } = useTranscriptionService();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFileError(null);
    
    if (selectedFile) {
      if (validateFile(selectedFile, setFileError)) {
        setFile(selectedFile);
        
        // Estimate cost based on file size
        if (hasValidApiKey()) {
          const estimatedDuration = estimateDuration(selectedFile);
          estimateAudioCost(estimatedDuration);
        }
        
        toast({
          title: "File selected",
          description: selectedFile.name,
        });
      } else {
        event.target.value = ""; // Reset the input
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    
    // Create a new AbortController for this upload
    abortControllerRef.current = new AbortController();
    
    // Read file as ArrayBuffer to simulate real upload
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    
    reader.onload = async (e) => {
      if (!e.target?.result) {
        toast({
          title: "Upload failed",
          description: "There was an error reading your audio file",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }
      
      // Simulate chunked upload with progress
      const totalChunks = 20;
      let currentChunk = 0;
      
      const interval = setInterval(() => {
        if (abortControllerRef.current?.signal.aborted) {
          clearInterval(interval);
          setUploading(false);
          return;
        }
        
        currentChunk++;
        const progress = Math.round((currentChunk / totalChunks) * 100);
        setUploadProgress(progress);
        
        if (currentChunk >= totalChunks) {
          clearInterval(interval);
          setUploading(false);
          setUploadComplete(true);
          
          // Store file info in sessionStorage
          sessionStorage.setItem("uploadedFileName", file.name);
          sessionStorage.setItem("uploadedFileType", file.type);
          sessionStorage.setItem("uploadedFileSize", file.size.toString());
          
          // Create local audio URL for preview
          const objectUrl = URL.createObjectURL(file);
          sessionStorage.setItem("lastAudioURL", objectUrl);
          
          // Process the uploaded file
          const audioBlob = new Blob([e.target.result], { type: file.type });
          processFile(audioBlob);
        }
      }, 100);
    };
    
    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "There was an error reading your audio file",
        variant: "destructive",
      });
      setUploading(false);
      setFileError("Failed to read the file. The file may be corrupt or inaccessible.");
    };
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    toast({
      title: "Upload cancelled",
      description: "Audio upload was cancelled",
    });
    
    setUploading(false);
    setUploadProgress(0);
  };

  const processFile = async (audioBlob: Blob) => {
    try {
      // Process the audio with our transcription service
      await processAudio(audioBlob, estimateDuration(file!));
      
      // Navigate to summary after a brief pause
      setTimeout(() => {
        navigate("/summary");
      }, 1500);
    } catch (error) {
      console.error("Error processing audio:", error);
      // Error handling is already done in the hook
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-medium mb-2">Upload Audio</h2>
        <p className={`${
          isColoredMode 
            ? isYellowTheme 
              ? "text-black" 
              : "text-white" 
            : "text-muted-foreground"
        }`}>Select an audio file from your device</p>
      </div>

      {fileError && (
        <Alert variant="destructive" className="mb-4 max-w-xs">
          <AlertTitle>File Error</AlertTitle>
          <AlertDescription>{fileError}</AlertDescription>
        </Alert>
      )}

      <UploadIcon status={status} file={file} />

      <StatusDisplay 
        status={status}
        progress={progress}
        error={error}
        estimatedCost={estimatedCost}
        source="upload"
      />

      {!uploadComplete && status === TranscriptionStatus.Idle && (
        <FileSelection
          file={file}
          uploading={uploading}
          onFileChange={handleFileChange}
        />
      )}

      <UploadProgress
        uploading={uploading}
        uploadProgress={uploadProgress}
        onCancel={cancelUpload}
      />

      <UploadButton
        file={file}
        uploadComplete={uploadComplete}
        uploading={uploading}
        status={status}
        onUpload={handleUpload}
      />
    </div>
  );
};
