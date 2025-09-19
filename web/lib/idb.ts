"use client"

import { get, set, del, keys } from "idb-keyval";

const KEY_PREFIX = "loan-csv:";
const CURRENT_KEY = "fp"; // Placeholder

export type StoredCSV = {
  blob: Blob;
  name: string;
  type: string;
  size: number;
  lastModified: number;
};

// IndexedDB functions for CSV files
export async function saveCSV(file: File, fp: string) {
  // Save the blob and metadata to IndexedDB
  try {
    // Clear IndexedDB
    const keys = await listCSVKeys();
    for (let key of keys) {
      delCSV(key);
    }

    const payload: StoredCSV = {
      blob: new Blob([file], { type: "text/csv" }),
      name: file.name || "loan_book.csv",
      type: file.type || "text/csv",
      size: file.size || (file as Blob).size,
      lastModified: file.lastModified || Date.now(),
    };

    await set(KEY_PREFIX + fp, payload);
  } catch (e) {
    console.error("Error saving CSV to IndexedDB:", e);
  }
}

export async function getCSV(fp: string): Promise<File | null> {
  // get StoredCSV from IndexedDB and then reconstruct to File
  try {
    const stored: StoredCSV | undefined = await get(KEY_PREFIX + fp);
    if (!stored) return null;

    return new File([stored.blob], stored.name, {
      type: stored.type,
      lastModified: stored.lastModified,
    });
  } catch (e) {
    console.error("Error retrieving CSV from IndexedDB:", e);
    return null;
  }
}

export async function delCSV(fp: string) {
  try {
    await del(KEY_PREFIX + fp);
  } catch (e) {
    console.error("Error deleting CSV from IndexedDB:", e);
  }
}

export async function listCSVKeys(): Promise<string[]> {
  try {
    const CSVkeys = await keys();
    return (CSVkeys as string[])
      .filter((key) => key.startsWith(KEY_PREFIX))
      .map((key) => key.slice(KEY_PREFIX.length, key.length));
  } catch (e) {
    console.error("Error listing CSVs from IndexedDB:", e);
    return [];
  }
}

// SessionStorage functions for current session's fp
export function setCurrentKey(fp: string) {
  sessionStorage.setItem(CURRENT_KEY, fp);
}

export function getCurrentKey(): string | null {
  return sessionStorage.getItem(CURRENT_KEY);
}

export function clearCurrentKey() {
  sessionStorage.removeItem(CURRENT_KEY);
}
