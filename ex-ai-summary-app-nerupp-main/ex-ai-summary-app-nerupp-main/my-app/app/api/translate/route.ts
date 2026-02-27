import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';


const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


const openai = new OpenAI({
  baseURL: process.env.GITHUB_MODEL_ENDPOINT || "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN!,
});


const DEFAULT_MODEL = "openai/gpt-4.1-mini";

const LANG_MAP = {
  zh: "简体中文",
  en: "英语",
  ja: "日语",
  ko: "韩语",
  fr: "法语",
  de: "德语"
};

export async function POST(req: NextRequest) {
  try {

    const { fileUrl, targetLang } = await req.json();

    if (!fileUrl) {
      return NextResponse.json(
        { ok: false, error: "Missing file path parameter fileUrl" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (!targetLang) {
      return NextResponse.json(
        { ok: false, error: "Missing target language parameters targetLang" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: fileData, error: storageError } = await supabase
      .storage
      .from('ai-summary-documents')
      .download(fileUrl);

    if (storageError) {
      return NextResponse.json(
        { ok: false, error: `Supabase File download failed: ${storageError.message}` },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const fileText = await fileData.text();
    if (!fileText) {
      return NextResponse.json(
        { ok: false, error: "The file is empty." },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const targetLanguage = LANG_MAP[targetLang as keyof typeof LANG_MAP] || "简体中文";
    const prompt = `请将以下文本准确、完整地翻译为${targetLanguage}，保持原文的语义和格式：\n\n${fileText}`;


    const aiResponse = await openai.chat.completions.create({
      model: process.env.GITHUB_MODEL_NAME || DEFAULT_MODEL, // 避免 undefined 报错
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.3,
      top_p: 1.0
    });


    const translation = aiResponse.choices[0].message.content?.trim() || "未生成有效翻译";
    
    return NextResponse.json(
      { ok: true, translation: translation },
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const errorMessage = (err as Error).message || "Translation interface unknown error";
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}