
"use client";

import type { ChangeEvent } from 'react';
import React, { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface FileUploadProps {
  onFileSelect: (fileDataUrl: string | null) => void;
  currentImagePreview?: string | null;
  acceptedFileTypes?: string; // e.g., "image/png, image/jpeg"
  label?: string;
  disabled?: boolean;
}

export default function FileUpload({
  onFileSelect,
  currentImagePreview,
  acceptedFileTypes = "image/*",
  label = "Upload Image",
  disabled = false,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImagePreview || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPreview(currentImagePreview || null);
  }, [currentImagePreview]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onFileSelect(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the input field
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {preview && (
        <div className="relative w-48 h-48 border rounded-md overflow-hidden group">
          <Image src={preview} alt="Preview" layout="fill" objectFit="cover" unoptimized />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemoveImage}
            aria-label="Remove image"
            disabled={disabled}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFileTypes}
          className="hidden"
          id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          disabled={disabled}
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()} 
          disabled={disabled}
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          {preview ? "Change Image" : "Select Image"}
        </Button>
      </div>
    </div>
  );
}
