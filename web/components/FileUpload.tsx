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
      <div className="mx-auto w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <label className="text-sm font-medium">{statusMap[status]}</label>
        {status === "error" && <div className="mt-2 rounded-lg border border-red-300 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
        <div className="mt-3 rounded-2xl border-2 border-dashed p-6 text-center hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
          <input className="mx-auto block w-full max-w-xs cursor-pointer rounded-lg border p-2 text-sm file:mr-4 file:rounded-lg file:border file:px-3 file:py-1.5"
            type="file" onChange={handleFileChange} id="csv-upload" accept=".csv,text/csv"
            disabled={status === "loading" || status === "done"}/>
          <p className="mt-2 text-xs text-neutral-500">CSV only • {"<"} 10MB recommended</p>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={status === "loading" || !file}
            className="rounded-xl bg-black px-5 py-2.5 text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {status === "loading" ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </div>
    </>
  )
}

export default FileUpload;
