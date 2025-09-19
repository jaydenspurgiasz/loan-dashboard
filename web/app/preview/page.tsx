"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCSV, getCurrentKey, saveCSV } from '@/lib/idb'
import { FilePreview, getPreview } from '@/lib/fileParse';
import {scoreFile} from '@/lib/actions/fileActions';

export default function Preview() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<FilePreview>({ head: [], tail: [], metadata: { rows: 0, cols: 0 } });

  useEffect(() => {
    const fetchKeyAndFile = async () => {
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
        } catch (error) {
          console.error("Error parsing CSV:", error);
        }
      }
    }
    updateCSV();
  }, [file])

  const handleSubmit = async () => {
    // Score, then go to analysis page
    try {
      const res: File = await scoreFile(file!, getCurrentKey()!);
      await saveCSV(res, await getCurrentKey()!);
    } catch (error) {
      console.error("Error scoring file: ", error);
    }
    router.push('/analyze');
  }

  return (
    <div>
      <div>File name: {file?.name}, Rows: {preview.metadata.rows}, Columns: {preview.metadata.cols}, Size: {file?.size} bytes</div>
      <div>Preview:</div>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ overflowX: 'auto', borderCollapse: 'separate', width: '100%' , borderSpacing: '30px 0'}}><tbody>
          {
            preview.head.map((line, index) => (
              <tr key={index}>
                {line.split(",").map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))
          }
          <tr><td colSpan={preview.metadata.cols}>...</td></tr>
          {
            preview.tail.map((line, index) => (
              <tr key={index}>
                {line.split(",").map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))
          }
        </tbody></table>
      </div>
    <div>
      <button onClick={handleSubmit}>Score and Analyze</button>
    </div>
    </div>
  )
}
