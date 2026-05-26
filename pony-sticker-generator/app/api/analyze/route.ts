import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { extractionRulesText, initialExpressions, pickLowestCountExpression } from '@/lib/rules';

export const runtime = 'nodejs';

function jsonFromText(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in model output');
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY in server environment.' }, { status: 500 });
    }

    const form = await req.formData();
    const image = form.get('image');
    if (!(image instanceof File)) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64 = buffer.toString('base64');
    const mime = image.type || 'image/png';
    const dataUrl = `data:${mime};base64,${base64}`;

    const openai = new OpenAI({ apiKey });
    const expression = pickLowestCountExpression(initialExpressions);

    const instruction = `You analyze a pixel pony source image for a sticker generator. Return ONLY valid JSON.

${extractionRulesText}

Important: the image is only for structured character information extraction. Do not describe final art style. Do not invent features.

Return this exact JSON shape with concise English values:
{
  "traits": {
    "bodyColor": "...",
    "maneColor": "...",
    "eyeColor": "...",
    "horn": "present/absent + color/reason",
    "wings": "present/absent + color/reason",
    "tail": "present/absent + color/reason",
    "accessory": "present/absent + type/color/reason",
    "species": "pony/unicorn/pegasus/alicorn"
  }
}`;

    const response = await openai.responses.create({
      model: process.env.OPENAI_VISION_MODEL || 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: instruction },
            { type: 'input_image', image_url: dataUrl },
          ],
        },
      ],
    });

    const outputText = response.output_text || '';
    const parsed = jsonFromText(outputText);
    return NextResponse.json({ traits: parsed.traits, expression });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Analyze failed.' }, { status: 500 });
  }
}
