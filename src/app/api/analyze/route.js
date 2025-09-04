import { NextResponse } from 'next/server';

// Esta configuração aumenta o tempo limite da API para 60 segundos na Vercel
export const maxDuration = 60;

async function queryHuggingFace(texts) {
  // ESPIÃO 3: Vamos conferir o crachá ANTES de usar.
  console.log("ESPIÃO 3: O crachá (API Key) que estou usando é:", process.env.HUGGING_FACE_API_KEY ? "ENCONTRADO!" : "!!! NÃO ENCONTRADO / NULO !!!");

  // ESPIÃO 4: Confirmando que estamos prestes a ligar para o fornecedor.
  console.log("ESPIÃO 4: Ligando para o fornecedor Hugging Face...");
  
  const response = await fetch(
    "https://api-inference.huggingface.co/models/tabularisai/multilingual-sentiment-analysis",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: texts }),
    }
  );

  // ESPIÃO 5: O que o fornecedor respondeu? Vamos ver a resposta bruta.
  console.log("ESPIÃO 5: O fornecedor atendeu com o status:", response.status, response.statusText);
  
  // Vamos ler a resposta como texto para ver se não é um erro HTML
  const responseBodyText = await response.text();
  console.log("ESPIÃO 6: O corpo da resposta do fornecedor foi:", responseBodyText);

  // Agora sim tentamos transformar em JSON
  return JSON.parse(responseBodyText);
}

export async function POST(request) {
  // ESPIÃO 1: A cozinha recebeu o pedido?
  console.log("\n--- NOVO PEDIDO RECEBIDO ---");
  console.log("ESPIÃO 1: A cozinha recebeu um pedido!");

  try {
    const { messages } = await request.json();

    // ESPIÃO 2: Quais ingredientes vieram no pedido?
    console.log("ESPIÃO 2: Os ingredientes (mensagens) recebidos são:", messages);

    if (!messages || !messages.length) {
      return NextResponse.json({ error: "Nenhuma mensagem." }, { status: 400 });
    }
    
    const hfResponse = await queryHuggingFace(messages);

    // ESPIÃO 7: O prato final está pronto para ser servido!
    console.log("ESPIÃO 7: O prato final (já processado) é:", hfResponse);
    
    if (hfResponse.error) {
      return NextResponse.json({ error: `Erro da API: ${hfResponse.error}` }, { status: 502 });
    }
    
    return NextResponse.json(hfResponse, { status: 200 });
  } catch (error) {
    // ESPIÃO DE ERRO: Se a cozinha explodiu, qual foi a causa?
    console.error("!!! EXPLOSÃO NA COZINHA !!! O motivo foi:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}