"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCSV, getCurrentKey, saveCSV } from '@/lib/idb'
import { FilePreview, getPreview } from '@/lib/fileParse';
import {scoreFile} from '@/lib/actions/fileActions';
import Container from '@/components/Container';
import Card from '@/components/Card';
import MetaGrid from '@/components/MetaGrid';
import CSVPreview from '@/components/CSVPreview';

export default function Preview() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<FilePreview>({ head: [], tail: [], metadata: { rows: 0, cols: 0 } });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fetchKeyAndFile = async () => {
      setBusy(true);
      const key = await getCurrentKey();
      const filePromise = await getCSV(key!);
      setFile(filePromise);
    }
    fetchKeyAndFile();
  }, []);
  useEffect(() => {
    const updateCSV = async () => {
      if (file) {
        try {
          const csv = await getPreview(file);
          setPreview(csv!);
          setBusy(false);
          setError(null);
        } catch (error) {
          console.error("Error parsing CSV:", error);
          setError("Error parsing CSV: " + error);
        }
      }
    }
    updateCSV();
  }, [file])

  const handleSubmit = async () => {
    // Score, then go to analysis page
    try {
      setBusy(true);
      const res: File = await scoreFile(file!, getCurrentKey()!);
      await saveCSV(res, await getCurrentKey()!);
    } catch (error) {
      console.error("Error scoring file: ", error);
    }
    setBusy(false);
    router.push('/analyze');
  }

  return (
    <Container>
      <div className="grid gap-6">
        <Card title="Metadata">
          <MetaGrid metadata={preview.metadata as any} />
        </Card>

        <div>
          <CSVPreview FilePreviewProps={preview} />
          {error && <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
          <div className="mt-4 flex justify-end">
            <button onClick={handleSubmit} className="rounded-xl bg-black px-5 py-2.5 text-white disabled:opacity-50 dark:bg-white dark:text-black">
              {busy ? 'Scoring…' : 'Score and Analyze'}
            </button>
          </div>
        </div>
      </div>
    </Container>
  )
}
