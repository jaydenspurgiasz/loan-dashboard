"use client"

import Papa from "papaparse";

export type FilePreview = {
    head: string[];
    tail: string[];
    metadata: {
        rows: number;
        cols: number;
    }
}

export async function parseBlob(blob: Blob): Promise<string | void> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const csv = reader.result;
            if (typeof csv !== "string") {
                reject(new Error("Failed to read file as string"));
            } else {
                resolve(csv);
            }
        }
        reader.onerror = () => {
            reject(new Error("Failed to read file"));
        }
        reader.readAsText(blob);
    });
}

export async function getPreview(blob: Blob): Promise<FilePreview | void> {
    try {
        const csv = await parseBlob(blob);
        const rows = csv!.split("\n");
        const head = rows.slice(0, 5);
        const tail = rows.slice(-5);
        const metadata = {
            rows: rows.length,
            cols: rows[0].split(",").length
        }
        return { head, tail, metadata } as FilePreview;
    } catch(e) {
        throw e;
    }
}

type Row = Record<string, any>;

export async function parseCSV(blob: Blob): Promise<Row[] | void> {
    try {
        const csv = await parseBlob(blob);
        if (!csv) {
            throw new Error("No CSV data to parse");
        }

        let headers: string[] = [];
        return new Promise((resolve, reject) => {
            Papa.parse<Row>(csv, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                transform: (value, field) => {
                    if (field === "loan_risk") {
                        return parseFloat(value);
                    }
                    return value;
                },
                complete: r => r.errors.length ? reject(r.errors[0]) : resolve(r.data),
                error: reject,
            });
        });
    } catch (e) {
        throw e;
    }
}
