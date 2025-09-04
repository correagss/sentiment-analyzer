import { NextResponse } from 'next/server';

// Esta configuração aumenta o tempo limite da API para 60 segundos na Vercel
export const maxDuration = 15;

async function queryHuggingFace(texts) {
  
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

  
  const responseBodyText = await response.text();
  
  return JSON.parse(responseBodyText);
}

  export async function POST(request) {
  
  

  try {
    const { messages } = await request.json();

    if (!messages || !messages.length) {
      return NextResponse.json({ error: "Nenhuma mensagem." }, { status: 400 });
    }
    
    const hfResponse = await queryHuggingFace(messages);
    
    if (hfResponse.error) {
      return NextResponse.json({ error: `Erro da API: ${hfResponse.error}` }, { status: 502 });
    }
    
    return NextResponse.json(hfResponse, { status: 200 });
  } catch (error) {
    console.error("!!! EXPLOSÃO NA COZINHA !!! O motivo foi:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}