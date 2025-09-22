'use client'

import {useState} from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/FileUpload';
import { validateFile } from '@/lib/actions/fileActions';
import { saveCSV, setCurrentKey } from '@/lib/idb';
import { set } from 'idb-keyval';
import Container from '@/components/Container';


export default function Home() {
  const router = useRouter();

  const handleSubmit: (file: File | null) => Promise<void> = async (file) => {
    // Call validation from fileActions, then store to IndexedDB
    try {
      const fp = await validateFile(file!);

      // Store file to IndexedDB
      await saveCSV(file!, fp!);
      await setCurrentKey(fp!);

      router.push("/preview");
    } catch (error) {
      console.error("File validation failed:", error);
      alert("File validation failed. Please try again");
    }
  }
  
  return (
    <div>
      <Container>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-6">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              Turn raw CSVs into risk insight.
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300">
              Upload your portfolio CSV, run validation instantly, preview the data, then analyze.
            </p>
            <ul className="mt-2 grid gap-2 text-sm text-neutral-600 dark:text-neutral-300">
              <li>• Drag-and-drop CSV upload</li>
              <li>• Schema & value validation</li>
              <li>• Charts for PD, vintages, exposures</li>
            </ul>
          </div>
          <div>
            <FileUpload onSubmit={handleSubmit} />
          </div>
        </div>
      </Container>
    </div>
  )
}
