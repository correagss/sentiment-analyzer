'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import Link from 'next/link';

export default function HomePage() {
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
      setError("Por favor, selecione um arquivo.");
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
        if (errors.length > 0) { /* ... validações ... */ return; }
        if (data.length === 0 || !data[0].username || !data[0].message) { /* ... validações ... */ return; }
        const messages = data.map(row => row.message);
        
        try {
          const apiResponse = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
          });
          if (!apiResponse.ok) { /* ... tratamento de erro ... */ }
          const analysisResults = await apiResponse.json();

          

          const mainSentiments = analysisResults[0];

          if (!mainSentiments || !Array.isArray(mainSentiments)) {
            throw new Error("Formato da resposta da API inválido.");
          }

          
          const sentimentCounts = {};
          mainSentiments.forEach(res => {
            const label = res.label.toLowerCase(); 
            sentimentCounts[label] = (sentimentCounts[label] || 0) + 1;
          });
          
          if (Object.keys(sentimentCounts).length === 0) {
            throw new Error("Não foi possível determinar os sentimentos.");
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

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 py-5">
      <div className="card text-bg-dark shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card-body p-5">
          <h1 className="card-title text-center mb-4">Análise de Sentimento</h1>
          <div className="input-group mb-3">
            <input type="file" className="form-control" accept=".csv" onChange={handleFileChange} />
            <button className="btn btn-primary" type="button" onClick={handleAnalyze} disabled={!file || isLoading}>
              {isLoading ? 'Analisando...' : 'Analisar'}
            </button>
          </div>
          {error && <div className="alert alert-danger mt-4">{error}</div>}
          {dashboard && (
            <div className="mt-5">
              <h2 className="text-center mb-4">Resultados Consolidados</h2>
              <ul className="list-group list-group-flush">
                <li className="list-group-item text-bg-dark d-flex justify-content-between align-items-center">
                  Sentimento Mais Frequente:
                  <span className="badge bg-info fs-6">{dashboard.mostFrequent}</span>
                </li>
                <li className="list-group-item text-bg-dark d-flex justify-content-between align-items-center">
                  Pior Sentimento Identificado:
                  <span className="badge bg-danger fs-6">{dashboard.worstFeeling.label} ({dashboard.worstFeeling.score.toFixed(2)})</span>
                </li>
                <li className="list-group-item text-bg-dark d-flex justify-content-between align-items-center">
                  Índice de Satisfação:
                  <span className="badge bg-success fs-6">{dashboard.satisfactionIndex}%</span>
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className="card-footer text-center">
          <Link href="/politica-de-privacidade" className="text-white-50">
            Política de Privacidade
          </Link>
        </div>
      </div>
    </div>
  );
}