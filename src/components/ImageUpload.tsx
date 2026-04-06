import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";

interface ImageUploadProps {
  label: string;
  value: File | null | undefined;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  error,
  disabled = false,
  className = "",
  required = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(value);
  }, [value]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onChange(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onChange(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-white text-base font-medium">
        {label}
        {required && (
          <span className="text-red-500 ml-1 text-[20px]" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div className="space-y-3">
        <div
          onClick={handleClick}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
            transition-all duration-200 hover:border-pink-500 hover:bg-gray-800/50 bg-[#030B18]
            ${error ? "border-red-500" : "border-[#EE2B93]"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${preview ? "!border-[#2A3443] !border-solid bg-black" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />

          {preview ? (
            <div className="space-y-3">
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full object-cover mx-auto"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 hover:bg-red-600 transition-colors"
                >
                  <span className="block leading-none text-lg">×</span>
                </button>
              </div>
              <p className="text-white text-sm">Click to change image</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="text-gray-400 mx-auto mb-2 w-fit">
                  <Icon name="upload" />
                </div>
                <p className="text-white text-xl font-medium">Upload Profile Picture</p>
                <p className="text-gray-400 text-sm mt-1">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
          )}
        </div>

        {value && (
          <div className="bg-[#111B2D] rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-8 h-8 bg-pink-500 rounded flex items-center justify-center shrink-0">
                  <div className="text-white">
                    <Icon name="upload" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{value.name}</p>
                  <p className="text-gray-400 text-xs">
                    {(value.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
