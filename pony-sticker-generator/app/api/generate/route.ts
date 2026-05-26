import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { buildImagePrompt } from '@/lib/prompt';

export const runtime = 'nodejs';

const traitsSchema = z.object({
  bodyColor: z.string(),
  maneColor: z.string(),
  eyeColor: z.string(),
  horn: z.string(),
  wings: z.string(),
  tail: z.string(),
  accessory: z.string(),
  species: z.string(),
});

const expressionSchema = z.object({
  id: z.string(),
  zh: z.string(),
  en: z.string(),
  count: z.number(),
  text: z.string(),
  rule: z.string(),
});

const requestSchema = z.object({
  traits: traitsSchema,
  expression: expressionSchema,
});

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY in server environment.' }, { status: 500 });
    }

    const body = requestSchema.parse(await req.json());
    const prompt = buildImagePrompt(body.traits, body.expression);
    const openai = new OpenAI({ apiKey });

    // Critical workflow rule: do NOT pass the original pixel image here.
    // This endpoint only sends pure text prompt to the image model.
    const result = await openai.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2',
      prompt,
      size: (process.env.OPENAI_IMAGE_SIZE as any) || '1024x1024',
      quality: (process.env.OPENAI_IMAGE_QUALITY as any) || 'medium',
      n: 1,
    });

    const first = result.data?.[0] as any;
    const image = first?.b64_json
      ? `data:image/png;base64,${first.b64_json}`
      : first?.url || '';

    if (!image) {
      return NextResponse.json({ error: 'Image model returned no image.' }, { status: 500 });
    }

    return NextResponse.json({ image, prompt });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Generate failed.' }, { status: 500 });
  }
}
