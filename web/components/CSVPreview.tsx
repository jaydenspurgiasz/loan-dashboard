import { useEffect, useState } from 'react';
import Card from './Card'
import { FilePreview } from '@/lib/fileParse';



export default function CSVPreview({ FilePreviewProps }: { FilePreviewProps: FilePreview }) {
    const [preview, setPreview] = useState<FilePreview>(FilePreviewProps);
    useEffect(() => {
        setPreview(FilePreviewProps);
    }, [FilePreviewProps]);

    return (
        <div className="mt-6 grid gap-4">
            <Card title="CSV Preview">
                <div className="max-h-96 overflow-auto overflow-x-auto rounded-lg border">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-sm">
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {preview.head.map((line, idx) => (
                        <tr key={idx} className="odd:bg-neutral-50 dark:odd:bg-neutral-900/40">
                        {line.split(",").map((cell, cellIndex) => (
                            <td key={cellIndex} className="whitespace-nowrap px-3 py-2">{cell}</td>
                        ))}
                        </tr>
                    ))}
                    {preview.tail.map((line, idx) => (
                        <tr key={`t-${idx}`} className="odd:bg-neutral-50 dark:odd:bg-neutral-900/40">
                        {line.split(",").map((cell, cellIndex) => (
                            <td key={cellIndex} className="whitespace-nowrap px-3 py-2">{cell}</td>
                        ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </Card>
        </div>
    )
}
