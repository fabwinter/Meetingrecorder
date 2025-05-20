
// Define supported audio formats
export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg', // MP3
  'audio/mp4', // M4A, etc.
  'audio/wav', 
  'audio/ogg',
  'audio/webm',
  'audio/aac'
];

export const MAX_FILE_SIZE_MB = 50; // 50MB max file size

export const validateFile = (file: File, setFileError: (error: string | null) => void): boolean => {
  // Check file type
  if (!SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
    setFileError(`Unsupported audio format: ${file.type || 'unknown'}. Please upload MP3, WAV, M4A, OGG, or AAC files.`);
    return false;
  }
  
  // Check file size (convert bytes to MB)
  const fileSizeInMB = file.size / (1024 * 1024);
  if (fileSizeInMB > MAX_FILE_SIZE_MB) {
    setFileError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please upload a smaller file.`);
    return false;
  }
  
  return true;
};

export const estimateDuration = (file: File): number => {
  // Rough estimation based on file size and bitrate
  // For WAV: ~10MB per minute (uncompressed)
  // For MP3: ~1MB per minute (at 128kbps)
  const fileSizeInMB = file.size / (1024 * 1024);
  
  if (file.type === 'audio/wav') {
    return fileSizeInMB * 6; // 6 seconds per MB (rough estimate)
  } else {
    return fileSizeInMB * 60; // 60 seconds per MB for compressed formats (rough estimate)
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
