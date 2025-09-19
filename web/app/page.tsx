'use client'

import {useState} from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/FileUpload';
import { validateFile } from '@/lib/actions/fileActions';
import { saveCSV, setCurrentKey } from '@/lib/idb';
import { set } from 'idb-keyval';


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
    }
  }

  return (
    <div>
      <FileUpload onSubmit={handleSubmit}/>
    </div>
  )
}
