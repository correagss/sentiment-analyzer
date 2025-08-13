import { NextResponse } from 'next/server';

async function queryHuggingFace(texts) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/tabularisai/multilingual-sentiment-analysis",
    {
      headers: {
  Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
  "Content-Type": "application/json", 
},
      method: "POST",
      body: JSON.stringify({ inputs: texts }),
    }
  );
  return response.json();
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
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}