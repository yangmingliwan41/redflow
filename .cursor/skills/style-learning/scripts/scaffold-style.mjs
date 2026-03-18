#!/usr/bin/env node
/**
 * 生成“新增风格”代码骨架（不直接改文件，减少误改风险）
 *
 * 用法：
 *   node .cursor/skills/style-learning/scripts/scaffold-style.mjs --id muji_minimal --name "无印良品风"
 *
 * 输出：
 *   1) stylePrompts.ts 的条目骨架
 *   2) generation.ts 的 union + options 片段
 *   3) imageAnalysis.ts 的枚举提示
 *   4) imageGeneration.ts 的负面提示分支骨架
 */

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

function ensureName(name) {
  if (!name || typeof name !== 'string') throw new Error('缺少 --name');
  return name;
}

const { id, name } = (() => {
  const args = parseArgs(process.argv);
  return {
    id: ensureStyleId(args.id),
    name: ensureName(args.name),
  };
})();

const out = [];

out.push('### 1) `src/config/stylePrompts.ts` 条目骨架\n');
out.push('将下面内容粘贴到 `DEFAULT_STYLE_PROMPTS` 内（选择合适位置）：\n');
out.push('```ts');
out.push(`${id}: {`);
out.push(`  id: '${id}',`);
out.push(`  name: '${name}',`);
out.push(`  description: '一句话概括（给UI卡片用）',`);
out.push('  defaultPrompt: `【整体风格要求】');
out.push('- （从参考图抽取：配色、留白、构图、文字层级、质感）');
out.push('');
out.push('【视觉元素】');
out.push('- 背景：...');
out.push('- 配色方案：...');
out.push('- 构图：...');
out.push('- 装饰元素：...');
out.push('- 质感：...');
out.push('');
out.push('【文字排版】');
out.push('- 标题区比例：...');
out.push('- 标题字重/字号：...');
out.push('- 列表/要点：...');
out.push('- 对齐规则：...');
out.push('');
out.push('【风格一致性】');
out.push('- ...');
out.push('');
out.push('【重要约束】');
out.push('- 禁止水印、logo、品牌标识');
out.push('- 禁止渲染技术规格信息（分辨率/像素等数字）');
out.push('- 禁止渲染英文技术术语或参数说明');
out.push('- 所有描述均为风格指导，不应作为图片中的文字内容呈现`');
out.push('},');
out.push('```');

out.push('\n### 2) `src/types/generation.ts` 接入片段\n');
out.push('把下面两段分别加到 union 与 options：\n');
out.push('```ts');
out.push(`| '${id}'`);
out.push('```');
out.push('```ts');
out.push(`{ value: '${id}', label: '${name}' },`);
out.push('```');

out.push('\n### 3) `src/services/ai/imageAnalysis.ts` 枚举提示\n');
out.push('在分析 prompt 的 imageStyle 枚举字符串里加入：\n');
out.push('```txt');
out.push(`|${id}`);
out.push('```');

out.push('\n### 4) `src/services/ai/imageGeneration.ts` 负面提示分支骨架\n');
out.push('在 `buildNegativePrompt` 中加入（按风格禁忌增删）：\n');
out.push('```ts');
out.push(`} else if (style === '${id}') {`);
out.push('  baseNegative.push(');
out.push("    'cluttered',");
out.push("    'busy background',");
out.push("    'vibrant colors',");
out.push("    'neon',");
out.push("    'high saturation',");
out.push("    'overdesigned'");
out.push('  )');
out.push('}');
out.push('```');

process.stdout.write(out.join('\n') + '\n');

