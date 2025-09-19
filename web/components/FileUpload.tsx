'use client'

import {useState} from 'react'
import sha256 from '@/lib/hash';

type FileUploadProps = {onSubmit: (file: File | null) => Promise<void>};
const statusMap = {
  "upload": "Upload a CSV to start",
  "loading": "Processing file...",
  "done": "CSV loaded, redirecting...",
  "error": "File couldn't be parsed, try again"
}

function FileUpload({onSubmit}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"upload" | "loading" | "done" | "error">("upload");
  const [error, setError] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (e.target.files.length > 0) {
      // ... Multiple file functionality later: stack them
      setFile(e.target.files[0]);
      } else {
        setFile(e.target.files[0]);
      }
    } else {
      setFile(null);
    }
    setStatus("upload");
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setStatus("error");
      setError("No file selected");
      return;
    }

    setStatus("loading");
    try {
      await onSubmit(file);
      setStatus("done");
    } catch (e: unknown) {
      setStatus("error");
      if (e instanceof Error) {
        setError(e.message);
      } else if (typeof e === 'string') {
        setError(e);
      } else {
        setError("An unknown error occurred");
      }
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>{statusMap[status]}</label>
        {status === "error" && <div>{error}</div>}
        <input type="file" onChange={handleFileChange} id="csv-upload" accept=".csv" disabled={status === "loading" || status === "done"}/>
        <button type="submit" disabled={status == "loading" || !file}>{status === "loading" ? "Uploading..." : "Upload"}</button>
      </form>
    </>
  )
}

export default FileUpload;
