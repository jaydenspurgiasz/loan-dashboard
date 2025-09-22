"use server"

import sha256 from '@/lib/hash';
import { saveCSV } from '../idb';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function validateFile(file: File): Promise<string | null> {
    // Call API/validate endpoint then if valid, return true
    let res;
    const fp = await sha256(file);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API}/validate`, {
        method: "POST",
        body: formData,
    })
    if (!response.ok) {
        throw new Error(`/validate response status: ${response.status}`);
    }
    try {
        res = await response.json();
    } catch (error) {
        throw new Error("Failed to parse /validate response as JSON");
    }

    if (fp !== res.key) {
        throw new Error("File hash mismatch");
    }

    return fp;
}

function arrayToCsvBlob(data: any[]): Blob {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n');

  return new Blob([csvContent], { type: 'text/csv' });
}

export async function scoreFile(file: File, key: string): Promise<File> {
    let res;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fp", key);
    const response = await fetch(`${API}/score`, {
        method: "POST",
        body: formData
    })
    if (!response.ok) {
        throw new Error(`/score response error: ${response.status}`);
    }
    try {
        res = await response.json();
        res.scored = res.scored.map((row: any) => ({
            ...row,
            loan_risk: parseFloat(row.loan_risk)
        }));
        return new File([arrayToCsvBlob(res.scored)], `scored_${file.name}`, { type: "text/csv" , lastModified: Date.now()});
    } catch (error) {
        throw new Error("Failed to parse /score response as JSON");
    }
}
