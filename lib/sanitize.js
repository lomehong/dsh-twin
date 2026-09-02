/**
 * 人格文本归一化（从 index.ts 抽出共用）：
 * 人格文本会被原样注入 system prompt，这里是注入向量的最后防线。
 */
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
/**
 * 归一化多行人格字段：Unicode NFC → CR/LF 归一为 LF → 清除控制字符（保留换行）→
 * 折叠 3+ 连续换行 → 中和行首「#」（防在系统提示词里伪造章节结构）→ 去首尾空白。幂等。
 */
export function normalizePersonaText(input) {
    if (typeof input !== 'string')
        return '';
    return input
        .normalize('NFC')
        .replace(/\r\n?/g, '\n')
        .replace(/[\u0000-\u0009\u000B-\u001F\u007F\u0080-\u009F]/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^#/gm, ' #')
        .trim();
}
/** 归一化单行字段（名称/身份/知识种子）：在多行归一基础上折叠全部空白为单空格。幂等。 */
export function normalizePersonaLine(input) {
    return normalizePersonaText(input).replace(/\s+/g, ' ').trim();
}
export function twinWarn(...args) {
    try {
        console.warn('[dsh-twin]', ...args);
    }
    catch {
        /* 忽略 */
    }
}
/** $DSH_HOME 解析（env 优先，回退 ~/.dsh） */
export function dshHome() {
    return process.env.DSH_HOME ?? join(homedir(), '.dsh');
}
/** 旧 twin-config.json 路径（读取迁移回退用） */
export function legacyConfigPath() {
    return join(dshHome(), 'twin-config.json');
}
export function configExists(path) {
    return existsSync(path);
}
export function readText(path) {
    return readFileSync(path, 'utf8');
}
void join;
void existsSync;
void readFileSync;
