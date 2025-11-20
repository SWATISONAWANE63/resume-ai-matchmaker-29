import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
  accept?: Record<string, string[]>;
}

export const FileUploader = ({ onFileSelect, loading, accept }: FileUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: loading,
  });

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed p-8 transition-all cursor-pointer',
          isDragActive && 'border-primary bg-primary/5',
          !isDragActive && 'hover:border-primary/50',
          loading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          {selectedFile ? (
            <div className="flex items-center space-x-2 bg-secondary p-4 rounded-lg w-full max-w-sm">
              <FileText className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm truncate flex-1 text-left">{selectedFile.name}</span>
              {!loading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <>
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse (PDF, DOC, DOCX)
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {selectedFile && (
        <Button
          onClick={handleUpload}
          className="w-full"
          size="lg"
          disabled={loading}
        >
          {loading ? 'Analyzing Resume...' : 'Analyze Resume'}
        </Button>
      )}
    </div>
  );
};