import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// 1. Initialize Supabase (keep your original configuration)
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Initialize GitHub AI client (set default values to avoid undefined)
const openai = new OpenAI({
  baseURL: process.env.GITHUB_MODEL_ENDPOINT || "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN!,
});

// 3. Define constants to avoid repeating environment variables
const DEFAULT_MODEL = "openai/gpt-4.1-mini";

export async function POST(req: NextRequest) {
  try {
    // Receive file URL from frontend
    const { fileUrl } = await req.json();
    if (!fileUrl) {
      return NextResponse.json(
        { ok: false, error: "Missing file URL parameter: fileUrl" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Download file from Supabase
    const { data: fileData, error: storageError } = await supabase
      .storage
      .from('ai-summary-documents')
      .download(fileUrl);

    if (storageError) {
      return NextResponse.json(
        { ok: false, error: `Failed to download file from Supabase: ${storageError.message}` },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const fileText = await fileData.text();
    if (!fileText) {
      return NextResponse.json(
        { ok: false, error: "File content is empty" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Construct summary prompt
    const prompt = `Please summarize the following content concisely and clearly, keeping it within 200 words:\n${fileText}`;

    // Call GitHub AI (fix model parameter type error)
    const aiResponse = await openai.chat.completions.create({
      model: process.env.GITHUB_MODEL_NAME || DEFAULT_MODEL, // Key fix: set default value
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7
    });

    const summary = aiResponse.choices[0].message.content?.trim() || "No valid summary generated";
    return NextResponse.json(
      { ok: true, summary: summary },
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    // Error handling
    const errorMessage = (err as Error).message || "Unknown error in summary API";
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}