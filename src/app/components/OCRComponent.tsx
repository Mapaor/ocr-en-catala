"use client";

import React, { useState, useRef } from "react";
import { languages } from "../../lib/utils/languages"
import Tesseract from "tesseract.js";

export default function OCRComponent() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0].code);
  type OCRJob = {
    fileName: string;
    progressValue: number;
    progressStatus: "pending" | "processing" | "done" | "error";
    result: string;
  };
  const [jobs, setJobs] = useState<OCRJob[]>([]);
  // Removed unused openedDetail state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // OCR logic for files or images
  const processFiles = React.useCallback((files: FileList | File[]) => {
    const fileArr = Array.from(files);
    // Preview first image
    if (fileArr.length > 0) {
      const previewReader = new FileReader();
      previewReader.onload = (ev: ProgressEvent<FileReader>) => {
        setPreviewUrl(ev.target?.result as string);
      };
      previewReader.readAsDataURL(fileArr[0]);
    } else {
      setPreviewUrl(null);
    }
    const newJobs: OCRJob[] = fileArr.map(file => ({
      fileName: file.name,
      progressValue: 0,
      progressStatus: "pending" as const,
      result: "",
    }));
    setJobs(newJobs);
    fileArr.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = async (ev: ProgressEvent<FileReader>) => {
        const imageData = ev.target?.result;
        if (!imageData) return;
        setJobs(jobs => jobs.map((j, i) =>
          i === idx ? { ...j, progressStatus: "processing" as const } : j
        ));
        try {
          await Tesseract.recognize(
            imageData as string,
            selectedLanguage,
            {
              logger: (m: { status: string; progress: number }) => {
                if (m.status === "recognizing text") {
                  setJobs(jobs => jobs.map((j, i) =>
                    i === idx ? { ...j, progressValue: Math.round(m.progress * 100), progressStatus: "processing" as const } : j
                  ));
                }
              }
            }
          ).then(({ data }: { data: { text: string } }) => {
            setJobs(jobs => jobs.map((j, i) =>
              i === idx ? { ...j, progressValue: 100, progressStatus: "done" as const, result: data.text } : j
            ));
          });
        } catch {
          setJobs(jobs => jobs.map((j, i) =>
            i === idx ? { ...j, progressStatus: "error" as const, result: "Error processing image" } : j
          ));
        }
      };
      reader.readAsDataURL(file);
    });
  }, [selectedLanguage]);

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  // Handle drag & drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Handle paste
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData) {
        const items = e.clipboardData.items;
        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith("image")) {
            const file = items[i].getAsFile();
            if (file) files.push(file);
          }
        }
        if (files.length > 0) processFiles(files);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [processFiles]);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1200);
  };

  return (
    <div className="flex flex-col items-center w-full mt-8">
      <div className="w-full max-w-xl px-2 sm:px-0">
        <label className="block mb-2 text-lg font-semibold">Idioma</label>
        <select
          className="w-full p-2 border rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          value={selectedLanguage}
          onChange={e => setSelectedLanguage(e.target.value)}
        >
          {languages.map((lang: { code: string; language: string }) => (
            <option key={lang.code} value={lang.code}>{lang.language}</option>
          ))}
        </select>
        <div
          ref={dropZoneRef}
          className={`flex flex-col items-center justify-center border-2 rounded-lg p-6 sm:p-10 mb-6 transition-colors duration-200 cursor-pointer select-none ${isDragging ? "border-blue-400 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500" : "border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600"}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          tabIndex={0}
        >
            <svg className="w-14 h-14 text-blue-400 mb-3" xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="#0581fc"><path fill="#0581fc" d="M13 3v9.586l3.5-3.5l1.414 1.414L12 16.414L6.086 10.5L7.5 9.086l3.5 3.5V3h2ZM4.5 14v5h15v-5h2v7h-19v-7h2Z"/></svg>
          <p className="text-gray-700 dark:text-gray-300 text-center text-base font-medium mb-1">Arrossega o enganxa una imatge, o clica per seleccionar fitxers</p>
          <span className="text-xs text-gray-400 dark:text-gray-500">(Admet arrossegar, Ctrl+V, o selecció múltiple)</span>
          {previewUrl && (
            <div className="mt-4 mb-2 flex flex-col items-center">
              <img src={previewUrl} alt="Preview" className="max-h-40 rounded shadow border border-gray-200" />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Preview</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {jobs.length > 0 && (
          <div className="rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col gap-6 mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-300">Fitxer</th>
                    <th className="p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-300">Estat</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, idx) => (
                    <tr key={job.fileName} className="border-b dark:border-gray-600 last:border-b-0">
                      <td className="p-2 sm:p-3 align-top text-gray-800 dark:text-gray-200 text-xs sm:text-sm flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full" style={{backgroundColor: job.progressStatus === 'done' ? '#22c55e' : job.progressStatus === 'error' ? '#ef4444' : '#3b82f6'}}></span>
                        {job.fileName}
                      </td>
                      <td className="p-2 sm:p-3 align-top">
                        <div className="flex items-center gap-2">
                          <div className="w-20 sm:w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-3 relative">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${job.progressStatus === 'error' ? 'bg-red-400' : job.progressStatus === 'done' ? 'bg-green-400' : 'bg-blue-400'}`}
                              style={{ width: `${job.progressValue}%` }}
                            ></div>
                          </div>
                          {job.progressStatus === 'pending' && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1"><svg className="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /></svg>Esperant</span>
                          )}
                          {job.progressStatus === 'processing' && (
                            <span className="text-xs text-blue-400 dark:text-blue-500 flex items-center gap-1"><svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /></svg>Processant</span>
                          )}
                          {job.progressStatus === 'done' && (
                            <span className="text-xs text-green-500 dark:text-green-400 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Fet</span>
                          )}
                          {job.progressStatus === 'error' && (
                            <span className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Error</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-4 px-2 sm:px-6 pb-6">
              {jobs.map((job, idx) => (
                <div key={job.fileName + '-result'} className="rounded border border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Resultat</span>
                    {job.result && (
                      <button
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded focus:outline-none transition-colors duration-200 ${copiedIdx === idx ? 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/30' : 'text-blue-500 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50'}`}
                        onClick={() => handleCopy(job.result, idx)}
                      >
                        <span>{copiedIdx === idx ? 'Copiat!' : 'Copia'}</span>
                        {copiedIdx === idx ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="none">
                            <path fill="none" stroke="#14b8a6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2.75 8.75l3.5 3.5l7-7.5"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" fill="none">
                            <g stroke="#3b82f6" strokeLinejoin="round" strokeWidth="3">
                              <path strokeLinecap="round" d="M13 12.432v-4.62A2.813 2.813 0 0 1 15.813 5h24.374A2.813 2.813 0 0 1 43 7.813v24.375A2.813 2.813 0 0 1 40.187 35h-4.67"/>
                              <path d="M32.188 13H7.811A2.813 2.813 0 0 0 5 15.813v24.374A2.813 2.813 0 0 0 7.813 43h24.375A2.813 2.813 0 0 0 35 40.187V15.814A2.813 2.813 0 0 0 32.187 13Z"/>
                            </g>
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                  {job.progressStatus === "error" ? (
                    <span className="text-red-500 dark:text-red-400 text-xs">{job.result}</span>
                  ) : job.result ? (
                    <pre className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 p-2 rounded whitespace-pre-wrap text-xs text-gray-700 dark:text-gray-300 max-h-40 overflow-auto">{job.result}</pre>
                  ) : (
                    <span className="italic text-gray-400 dark:text-gray-500 text-xs flex items-center gap-1"><svg className="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /></svg>espera...</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}