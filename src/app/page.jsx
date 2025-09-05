'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  // --- A LÓGICA PERMANECE A MESMA ---
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setDashboard(null);
    }
  };

  const handleAnalyze = () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setDashboard(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';',
      complete: async (results) => {
        const { data, errors } = results;
        if (errors.length > 0) {
          setError("Error reading CSV. Please check the file format.");
          setIsLoading(false);
          return;
        }
        if (data.length === 0 || !data[0].username || !data[0].message) {
          setError("Invalid CSV. The 'username' and 'message' columns are required.");
          setIsLoading(false);
          return;
        }
        const messages = data.map(row => row.message);

        try {
          const apiResponse = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
          });
          if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
            throw new Error(errorBody.error || "Failed to communicate with the server.");
          }
          const analysisResults = await apiResponse.json();
          const mainSentiments = analysisResults[0];
          if (!mainSentiments || !Array.isArray(mainSentiments)) {
            throw new Error("Invalid API response format.");
          }

          const sentimentCounts = {};
          mainSentiments.forEach(res => {
            const label = res.label.toLowerCase();
            sentimentCounts[label] = (sentimentCounts[label] || 0) + 1;
          });

          if (Object.keys(sentimentCounts).length === 0) {
            throw new Error("Unable to determine sentiments.");
          }

          const mostFrequentLabelRaw = Object.keys(sentimentCounts).reduce((a, b) => sentimentCounts[a] > sentimentCounts[b] ? a : b);
          const mostFrequentOriginal = mainSentiments.find(s => s.label.toLowerCase() === mostFrequentLabelRaw)?.label || mostFrequentLabelRaw;

          const worstFeeling = mainSentiments.reduce((worst, current) => current.score < worst.score ? current : worst, mainSentiments[0]);

          const positiveCount = sentimentCounts['positive'] || 0;
          const veryPositiveCount = sentimentCounts['very positive'] || 0;
          const totalPositive = positiveCount + veryPositiveCount;

          const satisfactionIndex = ((totalPositive / messages.length) * 100).toFixed(2);

          setDashboard({ mostFrequent: mostFrequentOriginal, worstFeeling, satisfactionIndex });

        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // --- A PARTE VISUAL (RETURN) COM A CORREÇÃO DE CENTRALIZAÇÃO ---
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 py-5">
      <div className="card text-bg-dark shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card-body p-5">
          {/* O título com o ícone (já estava certo) */}
          <div className="d-flex justify-content-center align-items-center mb-4">
            <Image
              src="/panda.png"
              alt="Analyzer Icon"
              width={60} // Ajustei um pouco o tamanho para ficar mais harmônico
              height={60}
              className="me-3"
            />
            <h1 className="card-title mb-0 h2">Sentiment Analyzer</h1> {/* Usei h2 para diminuir um pouco o título */}
          </div>

          {/* --- O PAINEL DE UPLOAD CENTRALIZADO --- */}
          <div className="d-flex justify-content-center align-items-center mb-3">
            {/* O grupo do "Choose File" */}
            <div className="d-flex align-items-center">
              <label htmlFor="csv-upload" className="btn btn-secondary">
                Choose File
              </label>
              <input
                type="file"
                id="csv-upload"
                className="d-none"
                accept=".csv"
                onChange={handleFileChange}
              />
              <span className="ms-3 text-white-50 text-truncate" style={{ maxWidth: '150px' }}>
                {file?.name || 'No file chosen'}
              </span>
            </div>

            {/* O botão de "Analisar", agora um bom vizinho */}
            <button
              className="btn btn-primary ms-4"
              type="button"
              onClick={handleAnalyze}
              disabled={!file || isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          {/* --- FIM DA CORREÇÃO --- */}

          {error && <div className="alert alert-danger mt-4">{error}</div>}

          {dashboard && (
            <div className="mt-5">
              <h2 className="text-center mb-4">Consolidated Results</h2>
              <ul className="list-group list-group-flush">
                <li className="list-group-item text-bg-dark d-flex justify-content-between align-items-center">
                  Most Frequent Sentiment:
                  <span className="badge bg-info fs-6">{dashboard.mostFrequent}</span>
                </li>
                <li className="list-group-item text-bg-dark d-flex justify-content-between align-items-center">
                  Worst Sentiment Identified:
                  <span className="badge bg-danger fs-6">{dashboard.worstFeeling.label} ({dashboard.worstFeeling.score.toFixed(2)})</span>
                </li>
                <li className="list-group-item text-bg-dark d-flex justify-content-between align-items-center">
                  Satisfaction Index:
                  <span className="badge bg-success fs-6">{dashboard.satisfactionIndex}%</span>
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className="card-footer text-center">
          <Link href="/privacy-policy" className="text-white-50">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}