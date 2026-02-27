// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: '没有选择文件' }, { status: 400 });
    }

    // 生成唯一文件名，避免冲突
    const uniqueFileName = `${crypto.randomUUID()}-${file.name}`;
    
    // 上传文件到 Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('ai-summary-documents') // 确保这个存储桶名称和其他接口一致
      .upload(`summary-documents/${uniqueFileName}`, file); // 这里定义了文件在桶内的路径

    if (error) {
      throw new Error(`Supabase 上传失败: ${error.message}`);
    }

    // 关键修复：返回文件在存储桶内的相对路径，而不是完整的 public URL
    const filePath = data.path; 

    return NextResponse.json({
      ok: true,
      fileUrl: filePath // 返回的是类似 "summary-documents/xxx-test.txt" 的路径
    });

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}