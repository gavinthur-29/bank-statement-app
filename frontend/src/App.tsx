import { useState } from "react";

export default function App() {
  const [result, setResult] = useState<any>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    const res = await fetch("http://localhost:3001/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    setResult(data);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Bank Statement Processor</h1>

      <input type="file" onChange={handleUpload} />

      {result && (
        <pre style={{ marginTop: 20 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
