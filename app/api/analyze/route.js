import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text } = await request.json();
    if (!text || text.length < 50) {
      return NextResponse.json({ error: 'Text too short' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not set' }, { status: 500 });
    }

    const prompt = 'Analyze this research paper and respond ONLY with valid JSON, no markdown.\n\nPaper:\n' + text.slice(0, 12000) + '\n\nReturn exactly this JSON:\n{"title":"short title","overall_score":8,"verdict":"one sentence","summary":"2-3 sentences","methodology":"2-3 sentences","impact":"2-3 sentences","strengths":["s1","s2","s3"],"weaknesses":["w1","w2","w3"],"future_work":["f1","f2","f3"],"tags":["field","method","topic"],"metrics":{"novelty":8,"rigor":7,"clarity":8,"impact":7},"dimensions":{"Innovation":8,"Reproducibility":7,"Statistical Rigor":7,"Writing Quality":8,"Practical Value":7}}';

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err?.error?.message || 'Groq error' }, { status: res.status });
    }

    const data = await res.json();
    let raw = data.choices?.[0]?.message?.content?.trim() || '';
    raw = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(raw);
    return NextResponse.json(result);

  } catch(e) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}