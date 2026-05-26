'use client';

import React, { useMemo, useState } from 'react';
import {
  Upload,
  Wand2,
  Clipboard,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Database,
  Image as ImageIcon,
  Settings2,
  ShieldCheck,
  Download,
  Loader2,
} from 'lucide-react';
import { CharacterTraits, emptyTraits, ExpressionRule, initialExpressions, pickLowestCountExpression, styleSpec } from '@/lib/rules';
import { buildImagePrompt } from '@/lib/prompt';

const fieldLabels: Record<keyof CharacterTraits, string> = {
  bodyColor: '身体颜色',
  maneColor: '鬃毛/头发',
  eyeColor: '眼睛颜色',
  horn: '角',
  wings: '翅膀',
  tail: '尾巴',
  accessory: '配饰',
  species: '物种',
};

function Button({
  children,
  onClick,
  disabled,
  variant = 'primary',
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit';
}) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-700',
    secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-500',
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>{children}</button>;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white/85 shadow-sm border border-black/5 ${className}`}>{children}</div>;
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [traits, setTraits] = useState<CharacterTraits>(emptyTraits);
  const [expressions, setExpressions] = useState<ExpressionRule[]>(initialExpressions);
  const [selectedExpression, setSelectedExpression] = useState<ExpressionRule>(() => pickLowestCountExpression(initialExpressions));
  const [promptVisible, setPromptVisible] = useState(false);
  const [result, setResult] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const prompt = useMemo(() => buildImagePrompt(traits, selectedExpression), [traits, selectedExpression]);
  const hasTraits = Object.values(traits).some(Boolean);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    if (!next) return;
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setResult('');
    setError('');
  };

  const updateTrait = (key: keyof CharacterTraits, value: string) => {
    setTraits((prev) => ({ ...prev, [key]: value }));
  };

  const analyzeImage = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError('');
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await fetch('/api/analyze', { method: 'POST', body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '解析失败');
      setTraits(json.traits);
      if (json.expression) setSelectedExpression(json.expression);
    } catch (e: any) {
      setError(e.message || '解析失败');
    } finally {
      setAnalyzing(false);
    }
  };

  const selectBalancedExpression = () => {
    const next = pickLowestCountExpression(expressions);
    setSelectedExpression(next);
  };

  const markExpressionUsed = () => {
    setExpressions((prev) => prev.map((item) => item.id === selectedExpression.id ? { ...item, count: item.count + 1 } : item));
    setSelectedExpression((prev) => ({ ...prev, count: prev.count + 1 }));
  };

  const generate = async () => {
    setGenerating(true);
    setError('');
    setResult('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traits, expression: selectedExpression }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '生成失败');
      setResult(json.image || '');
      markExpressionUsed();
    } catch (e: any) {
      setError(e.message || '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
  };

  const exportRules = () => {
    const data = { styleSpec, expressions, traits, selectedExpression, prompt };
    downloadText('pony-sticker-rules-export.json', JSON.stringify(data, null, 2));
  };

  return (
    <div className="min-h-screen bg-[#f5efe5] text-slate-900">
      <header className="border-b border-black/5 bg-[#f8f1e8]/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs shadow-sm mb-2">
              <Sparkles size={14} /> AI Pony Sticker Workflow
            </div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">像素小马 → 手绘表情包生成网站</h1>
            <p className="text-sm text-slate-500 mt-1">源图只进入解析模块，最终生图只使用纯文字 Prompt。</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportRules}><Download size={16} className="mr-2" />导出规则</Button>
            <Button onClick={generate} disabled={!hasTraits || generating}>
              {generating ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Wand2 size={16} className="mr-2" />}
              生成表情包
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 md:p-8 space-y-6">
        {error ? <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-800">{error}</div> : null}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-4 p-5 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Upload size={20} />1. 上传源像素图</h2>
            <label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center hover:bg-slate-50 transition">
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              <ImageIcon className="mx-auto mb-2 text-slate-400" />
              <span className="text-sm text-slate-500">点击上传图片</span>
            </label>
            {preview ? (
              <img src={preview} alt="source preview" className="w-full rounded-2xl border bg-slate-100 object-contain max-h-72" />
            ) : (
              <div className="h-56 rounded-2xl bg-slate-100 grid place-items-center text-slate-400 text-sm">暂无图片</div>
            )}
            <Button onClick={analyzeImage} disabled={!file || analyzing}>
              {analyzing ? <Loader2 size={16} className="mr-2 animate-spin" /> : <CheckCircle2 size={16} className="mr-2" />}
              解析角色信息
            </Button>
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 flex gap-3">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <div>解析使用视觉模型；生成图片时不会把源像素图传给生图模型。</div>
            </div>
          </Card>

          <Card className="lg:col-span-8 p-5 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Database size={20} />2. 角色信息解析卡</h2>
            <p className="text-sm text-slate-500">可以手动修正。最终生图只使用这些文字信息。</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.keys(traits) as Array<keyof CharacterTraits>).map((key) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">{fieldLabels[key]}</label>
                  <input
                    value={traits[key]}
                    onChange={(e) => updateTrait(key, e.target.value)}
                    placeholder={`填写${fieldLabels[key]}...`}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-5 p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold flex items-center gap-2"><RefreshCw size={20} />3. 表情平衡选择</h2>
              <Button variant="secondary" onClick={selectBalancedExpression}>选低次数表情</Button>
            </div>
            <div className="rounded-2xl bg-slate-50 border p-4">
              <div className="text-2xl font-bold">{selectedExpression.zh} / {selectedExpression.en}</div>
              <p className="text-sm text-slate-600 mt-2">{selectedExpression.rule}</p>
              <p className="text-sm mt-2">手写字：<span className="font-semibold">{selectedExpression.text}</span></p>
              <p className="text-sm mt-1">当前次数：{selectedExpression.count}</p>
            </div>
            <div className="max-h-72 overflow-auto rounded-2xl border bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 sticky top-0"><tr><th className="text-left p-2">表情</th><th className="text-left p-2">英文</th><th className="text-right p-2">次数</th></tr></thead>
                <tbody>
                  {expressions.slice().sort((a, b) => a.count - b.count || a.zh.localeCompare(b.zh)).map((e) => (
                    <tr key={e.id} className="border-t cursor-pointer hover:bg-slate-50" onClick={() => setSelectedExpression(e)}>
                      <td className="p-2">{e.zh}</td>
                      <td className="p-2 text-slate-500">{e.en}</td>
                      <td className="p-2 text-right">{e.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="lg:col-span-7 p-5 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><ShieldCheck size={20} />4. V1/V2 画风库约束</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 border p-3"><b>图库：</b>V1 {styleSpec.v1Count} 张；V2 {styleSpec.v2Count} 张</div>
              <div className="rounded-xl bg-slate-50 border p-3"><b>构图：</b>{styleSpec.composition}</div>
              <div className="rounded-xl bg-slate-50 border p-3"><b>线条：</b>{styleSpec.linework}</div>
              <div className="rounded-xl bg-slate-50 border p-3"><b>上色：</b>{styleSpec.coloring}</div>
              <div className="rounded-xl bg-slate-50 border p-3"><b>背景：</b>{styleSpec.background}</div>
              <div className="rounded-xl bg-slate-50 border p-3"><b>文字：</b>{styleSpec.text}</div>
            </div>
            <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-900">
              <b>硬禁止：</b>{styleSpec.hardNegative.slice(0, 12).join('；')}……
            </div>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-7 p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 className="text-xl font-semibold flex items-center gap-2"><Settings2 size={20} />5. 纯文字生图提示词</h2>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setPromptVisible((v) => !v)}>{promptVisible ? '隐藏' : '显示'}</Button>
                <Button variant="secondary" onClick={copyPrompt}><Clipboard size={16} className="mr-2" />复制</Button>
              </div>
            </div>
            {promptVisible ? (
              <pre className="whitespace-pre-wrap rounded-2xl bg-slate-950 text-slate-100 p-4 text-xs md:text-sm overflow-auto max-h-[520px]">{prompt}</pre>
            ) : (
              <div className="rounded-2xl bg-slate-100 p-6 text-sm text-slate-500">提示词已在内部生成。生成 API 只接收这段纯文字，不接收源像素图。</div>
            )}
          </Card>

          <Card className="lg:col-span-5 p-5 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Wand2 size={20} />6. 生成结果</h2>
            {result ? (
              <img src={result} alt="generated pony sticker" className="rounded-2xl bg-[#eee5d8] border aspect-square object-contain w-full" />
            ) : (
              <div className="rounded-2xl bg-slate-100 border aspect-square grid place-items-center text-slate-400 text-sm">尚未生成</div>
            )}
            <Button onClick={generate} disabled={!hasTraits || generating}>
              {generating ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Wand2 size={16} className="mr-2" />}
              用当前解析生成表情包
            </Button>
            <p className="text-xs text-slate-500">生成后会自动给当前表情计数 +1。生产版建议把计数保存到数据库。</p>
          </Card>
        </section>
      </main>
    </div>
  );
}
