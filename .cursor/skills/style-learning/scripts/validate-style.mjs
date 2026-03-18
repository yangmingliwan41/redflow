#!/usr/bin/env node
/**
 * 校验风格 ID 是否完整接入红流云创的 4 个关键位置
 *
 * 用法：
 *   node .cursor/skills/style-learning/scripts/validate-style.mjs --id muji_minimal
 *
 * 规则：
 * - 必须存在于 `src/config/stylePrompts.ts`
 * - 必须存在于 `src/types/generation.ts`（类型 union + IMAGE_STYLE_OPTIONS）
 * - 必须存在于 `src/services/ai/imageAnalysis.ts` 的枚举字符串
 * - 建议存在于 `src/services/ai/imageGeneration.ts` 的 buildNegativePrompt 分支
 */

import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function ensureStyleId(id) {
  if (!id || typeof id !== 'string') throw new Error('缺少 --id');
  if (!/^[a-z0-9_]+$/.test(id)) {
    throw new Error(`--id 不合法：${id}\n要求：小写字母/数字/下划线，例如 muji_minimal`);
  }
  return id;
}

const args = parseArgs(process.argv);
const styleId = ensureStyleId(args.id);

const root = process.cwd();
const targets = {
  stylePrompts: path.join(root, 'src', 'config', 'stylePrompts.ts'),
  generationTypes: path.join(root, 'src', 'types', 'generation.ts'),
  imageAnalysis: path.join(root, 'src', 'services', 'ai', 'imageAnalysis.ts'),
  imageGeneration: path.join(root, 'src', 'services', 'ai', 'imageGeneration.ts'),
};

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function has(content, needle) {
  return content.includes(needle);
}

function resultLine(ok, label, details) {
  const status = ok ? 'OK ' : 'MISS';
  return `${status}  ${label}${details ? `  ${details}` : ''}`;
}

const stylePromptsContent = read(targets.stylePrompts);
const generationContent = read(targets.generationTypes);
const analysisContent = read(targets.imageAnalysis);
const genContent = read(targets.imageGeneration);

const checks = [];

// 1) stylePrompts
checks.push({
  label: 'stylePrompts.ts: DEFAULT_STYLE_PROMPTS 包含该ID',
  ok: has(stylePromptsContent, `${styleId}:`) || has(stylePromptsContent, `id: '${styleId}'`) || has(stylePromptsContent, `id: "${styleId}"`),
});

// 2) generation union
checks.push({
  label: 'generation.ts: imageStyle union 包含该ID',
  ok: has(generationContent, `'${styleId}'`) || has(generationContent, `"${styleId}"`),
});

// 3) generation options
checks.push({
  label: 'generation.ts: IMAGE_STYLE_OPTIONS 包含该ID',
  ok: has(generationContent, `value: '${styleId}'`) || has(generationContent, `value: "${styleId}"`),
});

// 4) imageAnalysis enum string
checks.push({
  label: 'imageAnalysis.ts: prompt 枚举允许该ID',
  ok: has(analysisContent, `|${styleId}`) || has(analysisContent, `${styleId}|`) || has(analysisContent, `${styleId}"`),
});

// 5) imageGeneration negative prompt branch (recommended)
checks.push({
  label: 'imageGeneration.ts: buildNegativePrompt 有该风格分支（建议）',
  ok: has(genContent, `style === '${styleId}'`) || has(genContent, `style === "${styleId}"`),
  recommended: true,
});

const failed = checks.filter(c => !c.ok && !c.recommended);
const recommendedMiss = checks.filter(c => !c.ok && c.recommended);

console.log(`\n[Style Integration Check] styleId=${styleId}\n`);
for (const c of checks) {
  console.log(resultLine(c.ok, c.label));
}

if (failed.length === 0) {
  console.log('\n✅ 必需接入项已满足。');
} else {
  console.log('\n❌ 存在缺失的必需接入项：');
  for (const c of failed) console.log(`- ${c.label}`);
  process.exitCode = 2;
}

if (recommendedMiss.length > 0) {
  console.log('\n⚠️ 建议补充项缺失（不会阻止构建，但容易跑偏）：');
  for (const c of recommendedMiss) console.log(`- ${c.label}`);
}

console.log('\n下一步建议：运行 `npm run build` 做最终构建校验。\n');

