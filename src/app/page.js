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
    if (e.target.files) {
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
      complete: async (results) => {
        const { data, errors } = results;
        if (errors.length > 0) {
          setError("Erro ao ler o CSV. Verifique o formato.");
          setIsLoading(false);
          return;
        }
        if (data.length === 0 || !data[0].username || !data[0].message) {
          setError("CSV inválido. As colunas 'username' e 'message' são obrigatórias.");
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
            throw new Error(errorBody.error || "Falha na comunicação com o servidor.");
          }

          const analysisResults = await apiResponse.json();
          
          const mainSentiments = analysisResults.map(resultGroup => {
            return resultGroup.reduce((best, current) => (current.score > best.score ? current : best));
          });

          
          const sentimentCounts = {};
          mainSentiments.forEach(res => {
            sentimentCounts[res.label] = (sentimentCounts[res.label] || 0) + 1;
          });
          if (Object.keys(sentimentCounts).length === 0) throw new Error("Não foi possível determinar os sentimentos.");
          const mostFrequent = Object.keys(sentimentCounts).reduce((a, b) => sentimentCounts[a] > sentimentCounts[b] ? a : b);
          
          
          const worstFeeling = mainSentiments.reduce((worst, current) => current.score < worst.score ? current : worst, mainSentiments[0]);
          
          
          const positiveCount = sentimentCounts['positive'] || 0;
          const satisfactionIndex = ((positiveCount / messages.length) * 100).toFixed(2);
          
          
          setDashboard({ mostFrequent, worstFeeling, satisfactionIndex });

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