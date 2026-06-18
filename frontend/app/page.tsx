"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const uploadPDF = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/docs/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Upload failed");
    }
  };

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        Document Signature App
      </h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
      />

      <br />
      <br />

      <button
        onClick={uploadPDF}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Upload PDF
      </button>

      <p className="mt-4">{message}</p>
    </main>
  );
}