"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs";

export default function Home() {
  const BACKEND_URL = "http://127.0.0.1:8000";

  const [file, setFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [publicLink, setPublicLink] = useState("");

  const [signatureText, setSignatureText] = useState("Ashutosh Nayak");
  const [position, setPosition] = useState({ x: 120, y: 120 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const uploadPDF = async () => {
    if (!file) {
      setMessage("Please select a PDF first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BACKEND_URL}/api/docs/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setMessage(data.message || "PDF uploaded successfully");

      if (data.document?.id) {
        setDocumentId(data.document.id);
      }
    } catch (error) {
      setMessage("Upload failed. Check if backend is running.");
    }
  };

  const saveSignature = async () => {
  const docId = documentId || 1;

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/signatures?doc_id=${docId}&user_id=1&x=${Math.round(
        position.x
      )}&y=${Math.round(position.y)}&page=1&signature_text=${encodeURIComponent(
        signatureText
      )}`,
      {
        method: "POST",
      }
    );

    const data = await response.json();
    alert(data.message || "Signature saved successfully");
  } catch (error) {
    alert("Signature save failed. Check backend.");
  }
};

const finalizePDF = async () => {
  const docId = documentId || 1;

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/signatures/finalize?doc_id=${docId}`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (data.download_url) {
      setDownloadUrl(`${BACKEND_URL}${data.download_url}`);
    }

    alert(data.message || "Signed PDF generated");
  } catch (error) {
    alert("Finalize failed. Check backend.");
  }
};
const createPublicLink = async () => {
  const docId = documentId || 1;

  try {
    const response = await fetch(`${BACKEND_URL}/api/docs/share/${docId}`, {
      method: "POST",
    });

    const data = await response.json();

    if (data.public_link) {
      setPublicLink(data.public_link);
    }

    alert(data.message || "Public signing link created");
  } catch (error) {
    alert("Public link creation failed. Check backend.");
  }
};

  return (
    <main style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "20px" }}>
        Document Signature App
      </h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => {
          const selected = e.target.files?.[0] || null;
          setFile(selected);

          if (selected) {
            setPdfFile(URL.createObjectURL(selected));
            setMessage("");
            setDocumentId(null);
          }
        }}
      />

      <br />
      <br />

      <button
        onClick={uploadPDF}
        style={{
          background: "#2563eb",
          color: "white",
          padding: "10px 18px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          marginRight: "10px",
        }}
      >
        Upload PDF
      </button>

      <p style={{ marginTop: "15px", fontWeight: "bold" }}>{message}</p>

      {documentId && (
        <p>
          Current Document ID: <b>{documentId}</b>
        </p>
      )}

      <div
        style={{
          marginTop: "25px",
          padding: "16px",
          border: "1px solid black",
          borderRadius: "8px",
          width: "fit-content",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>
          Project Status
        </h2>
        <p>PDF Upload Working ✅</p>
        <p>PDF Preview Working ✅</p>
        <p>Drag & Drop Signature ✅</p>
        <p>Signature API ✅</p>
        <p>Audit Logs ✅</p>
      </div>

      {pdfFile && (
        <div style={{ marginTop: "35px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>
            PDF Preview
          </h2>

          <div style={{ marginBottom: "15px" }}>
            <input
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              placeholder="Enter signature text"
              style={{
                padding: "10px",
                border: "1px solid gray",
                borderRadius: "5px",
                marginRight: "10px",
              }}
            />

            <button
              onClick={saveSignature}
              style={{
                background: "#16a34a",
                color: "white",
                padding: "10px 18px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Save Signature Position
            </button>

            <button
              onClick={finalizePDF}
              style={{
                background: "#dc2626",
                color: "white",
                padding: "10px 18px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Generate Signed PDF
            </button>
            {downloadUrl && (
  <div style={{ marginTop: "15px" }}>
    <a
      href={downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        background: "#7c3aed",
        color: "white",
        padding: "10px 18px",
        borderRadius: "6px",
        textDecoration: "none",
        display: "inline-block",
        fontWeight: "bold",
      }}
    >
      Download Signed PDF
    </a>
  </div>
)}
<div style={{ marginTop: "15px" }}>
  <button
    onClick={createPublicLink}
    style={{
      background: "#0f766e",
      color: "white",
      padding: "10px 18px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Create Public Signing Link
  </button>
</div>

{publicLink && (
  <div style={{ marginTop: "15px" }}>
    <p>
      Public Link:
      <a
        href={publicLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "blue",
          marginLeft: "8px",
          fontWeight: "bold",
        }}
      >
        {publicLink}
      </a>
    </p>
  </div>
)}
          </div>

          <p>
            Signature Position: X = {Math.round(position.x)}, Y ={" "}
            {Math.round(position.y)}
          </p>

          <div
            style={{
              position: "relative",
              display: "inline-block",
              border: "1px solid #999",
              background: "#f8f8f8",
            }}
            onMouseMove={(e) => {
              if (!dragging) return;

              const rect = e.currentTarget.getBoundingClientRect();

              setPosition({
                x: e.clientX - rect.left - offset.x,
                y: e.clientY - rect.top - offset.y,
              });
            }}
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
          >
            <Document
              file={pdfFile}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              {Array.from(new Array(numPages), (_, index) => (
                <Page
                  key={index}
                  pageNumber={index + 1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              ))}
            </Document>

            <div
              onMouseDown={(e) => {
                const box = e.currentTarget.getBoundingClientRect();

                setDragging(true);
                setOffset({
                  x: e.clientX - box.left,
                  y: e.clientY - box.top,
                });
              }}
              style={{
                position: "absolute",
                left: position.x,
                top: position.y,
                background: "yellow",
                padding: "10px 18px",
                border: "2px solid red",
                cursor: "move",
                zIndex: 1000,
                fontWeight: "bold",
                userSelect: "none",
              }}
            >
              {signatureText || "SIGN HERE"}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}