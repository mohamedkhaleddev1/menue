"use client";
import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Upload, X } from "lucide-react";
export default function ImageUploader({
  value,
  onChange,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null),
    [progress, setProgress] = useState(0),
    [error, setError] = useState(""),
    [info, setInfo] = useState(""),
    [mode, setMode] = useState<"device" | "url">("device"),
    [urlInput, setUrlInput] = useState(value);
  function applyLocalPreview(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      onChange(result);
      setUrlInput(result);
      setProgress(0);
      setInfo(
        "Preview ready. Connect Cloudinary to save uploaded files permanently.",
      );
    };
    reader.onerror = () => {
      setProgress(0);
      setError("Unable to read this image. Please try another file.");
    };
    reader.readAsDataURL(file);
  }
  function applyUrl() {
    setError("");
    setInfo("");
    try {
      const url = new URL(urlInput);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      onChange(url.toString());
    } catch {
      setError("Enter a valid http or https image URL.");
    }
  }
  async function upload(file: File) {
    setError("");
    setInfo("");
    if (
      !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
        file.type,
      )
    )
      return setError("Use JPG, PNG, WebP or AVIF.");
    if (file.size > 5 * 1024 * 1024)
      return setError("Image must be smaller than 5 MB.");
    setProgress(10);
    try {
      const signatureResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ folder: "dynamic-menu" }),
      });
      if (!signatureResponse.ok) {
        if (process.env.NODE_ENV === "development")
          return applyLocalPreview(file);
        const response = await signatureResponse.json().catch(() => null);
        throw new Error(
          signatureResponse.status === 401
            ? "Your admin session expired. Sign in again, then retry the upload."
            : response?.error || "Unable to authorize this upload.",
        );
      }
      const signed = await signatureResponse.json();
      if (!signed.cloudName || !signed.apiKey || !signed.signature) {
        if (process.env.NODE_ENV === "development")
          return applyLocalPreview(file);
        throw new Error("Image storage is not configured correctly.");
      }
      const data = new FormData();
      data.append("file", file);
      data.append("api_key", signed.apiKey);
      data.append("timestamp", String(signed.timestamp));
      data.append("signature", signed.signature);
      data.append("folder", signed.folder);
      setProgress(45);
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
        { method: "POST", body: data },
      );
      const result = await cloudinaryResponse.json().catch(() => null);
      if (!cloudinaryResponse.ok)
        throw new Error(
          result?.error?.message || "Cloudinary rejected this image.",
        );
      if (!result?.secure_url)
        throw new Error("The upload completed without an image URL.");
      setProgress(100);
      onChange(result.secure_url);
      setTimeout(() => setProgress(0), 800);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error && uploadError.message
          ? uploadError.message
          : "Unable to upload image. Please try again.",
      );
      setProgress(0);
    }
  }
  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="mb-3 grid grid-cols-2 rounded-xl bg-[#eef1ec] p-1">
        <button
          type="button"
          onClick={() => setMode("device")}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${mode === "device" ? "bg-white shadow-sm" : "text-[#6f7972]"}`}
        >
          <Upload size={15} /> From device
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("url");
            setUrlInput(value);
          }}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${mode === "url" ? "bg-white shadow-sm" : "text-[#6f7972]"}`}
        >
          <Link2 size={15} /> From URL
        </button>
      </div>
      {value ? (
        <div>
          <div className="relative h-48 overflow-hidden rounded-xl border border-[#dfe2dc] bg-[#f4f5f1]">
            <img
              src={value}
              alt="Upload preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                onChange("");
                setUrlInput("");
                setInfo("");
              }}
              aria-label="Remove image"
              className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white text-red-600 shadow-md"
            >
              <X size={16} />
            </button>
          </div>
          {mode === "device" && (
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8ddd7] bg-white px-4 py-2.5 text-sm font-bold text-[#405248]"
            >
              <Upload size={16} /> Replace from device
            </button>
          )}
        </div>
      ) : mode === "device" ? (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="grid h-36 w-full place-items-center rounded-xl border border-dashed border-[#bdc5bd] bg-[#f8f9f6] text-sm text-[#778078]"
        >
          <span className="grid justify-items-center gap-2">
            <ImagePlus />
            Upload {label.toLowerCase()}
          </span>
        </button>
      ) : null}
      {mode === "url" && (
        <div className="mt-3">
          <span className="field-label">Image URL</span>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyUrl();
                }
              }}
              className="input min-w-0 flex-1"
              placeholder="Paste image URL here"
            />
            <button
              type="button"
              onClick={applyUrl}
              className="rounded-xl bg-[#1f3025] px-4 text-sm font-bold text-white"
            >
              Use URL
            </button>
          </div>
        </div>
      )}
      <input
        ref={input}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) upload(file);
        }}
      />
      {progress > 0 && progress < 100 && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <Loader2 className="animate-spin" size={14} />
          <div className="h-1 flex-1 overflow-hidden rounded bg-gray-200">
            <div
              className="h-full bg-[#1f3025]"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress}%
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {info && (
        <p className="mt-3 rounded-xl border border-[#d7e3d8] bg-[#f0f7f1] px-3 py-2.5 text-xs leading-5 text-[#48634e]">
          {info}
        </p>
      )}
    </div>
  );
}
