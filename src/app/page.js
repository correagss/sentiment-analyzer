'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import Link from 'next/link';

// Este é o nosso componente da página principal
export default function HomePage() {
  // --- ESTADOS DO COMPONENTE ---
  // Aqui guardamos as informações importantes que mudam na tela
  const [file, setFile] = useState(null); // O arquivo CSV que o usuário escolheu
  const [isLoading, setIsLoading] = useState(false); // Para saber se estamos esperando a API
  const [error, setError] = useState(null); // Para mostrar mensagens de erro
  const [dashboard, setDashboard] = useState(null); // Para guardar os resultados finais

  // --- FUNÇÕES ---

  // Esta função roda toda vez que o usuário escolhe um novo arquivo
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      // Limpa a tela de resultados ou erros antigos
      setError(null);
      setDashboard(null);
    }
  };

  // Esta é a função principal, que roda quando o botão "Analisar" é clicado
  const handleAnalyze = () => {
    if (!file) {
      setError("Por favor, selecione um arquivo.");
      return;
    }

    // Prepara a tela para a análise
    setIsLoading(true);
    setError(null);
    setDashboard(null);

    // Usa o PapaParse para ler o arquivo CSV
    Papa.parse(file, {
      header: true, // A primeira linha do CSV é o cabeçalho
      skipEmptyLines: true, // Ignora linhas em branco
      delimiter: ';', // AVISO IMPORTANTE: O separador é PONTO-E-VÍRGULA!
      complete: async (results) => {
        const { data, errors } = results;

        // VALIDAÇÃO 1: O PapaParse conseguiu ler?
        if (errors.length > 0) {
          setError("Erro ao ler o CSV. Verifique o formato do arquivo.");
          setIsLoading(false);
          return;
        }
        
        // VALIDAÇÃO 2: As colunas obrigatórias existem?
        if (data.length === 0 || !data[0].username || !data[0].message) {
          setError("CSV inválido. As colunas 'username' e 'message' são obrigatórias.");
          setIsLoading(false);
          return;
        }

        // Se passou nas validações, pegamos só as mensagens
        const messages = data.map(row => row.message);
        
        try {
          // Envia as mensagens para a nossa API interna
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
          
          // Simplifica a resposta da API para pegar o sentimento principal de cada mensagem
          const mainSentiments = analysisResults.map(resultGroup => {
            return resultGroup.reduce((best, current) => (current.score > best.score ? current : best));
          });

          // --- CÁLCULOS PARA O DASHBOARD ---

          // 1. Contagem de cada sentimento (convertendo para minúsculo para evitar erros)
          const sentimentCounts = {};
          mainSentiments.forEach(res => {
            const label = res.label.toLowerCase(); 
            sentimentCounts[label] = (sentimentCounts[label] || 0) + 1;
          });
          
          if (Object.keys(sentimentCounts).length === 0) {
            throw new Error("Não foi possível determinar os sentimentos a partir da resposta da API.");
          }
          
          // 2. Cálculo do Sentimento Mais Frequente
          const mostFrequentLabelRaw = Object.keys(sentimentCounts).reduce((a, b) => sentimentCounts[a] > sentimentCounts[b] ? a : b);
          const mostFrequentOriginal = mainSentiments.find(s => s.label.toLowerCase() === mostFrequentLabelRaw)?.label || mostFrequentLabelRaw;
          
          // 3. Cálculo do Pior Sentimento Identificado
          const worstFeeling = mainSentiments.reduce((worst, current) => current.score < worst.score ? current : worst, mainSentiments[0]);
          
          // 4. Cálculo do Índice de Satisfação
          // ...
// O Contador agora é esperto!
const positiveCount = sentimentCounts['positive'] || 0;
const veryPositiveCount = sentimentCounts['very positive'] || 0; // Ele aprendeu a contar 'very positive' também!
const totalPositive = positiveCount + veryPositiveCount; // Ele soma os dois!

// E agora a fórmula usa o total de positivos
const satisfactionIndex = ((totalPositive / messages.length) * 100).toFixed(2);
// ...
          
          // Monta o objeto final do dashboard para mostrar na tela
          setDashboard({ mostFrequent: mostFrequentOriginal, worstFeeling, satisfactionIndex });

        } catch (err) {
          setError(err.message);
        } finally {
          // Independentemente de dar certo ou errado, paramos de carregar
          setIsLoading(false);
        }
      }
    });
  };

  // --- VISUAL DA PÁGINA (JSX) ---
  // O que o usuário vê na tela
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

          {/* Se houver um erro, mostra este alerta */}
          {error && <div className="alert alert-danger mt-4">{error}</div>}

          {/* Se o dashboard estiver pronto, mostra os resultados */}
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