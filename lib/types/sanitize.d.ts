/**
 * 归一化多行人格字段：Unicode NFC → CR/LF 归一为 LF → 清除控制字符（保留换行）→
 * 折叠 3+ 连续换行 → 中和行首「#」（防在系统提示词里伪造章节结构）→ 去首尾空白。幂等。
 */
export declare function normalizePersonaText(input: unknown): string;
/** 归一化单行字段（名称/身份/知识种子）：在多行归一基础上折叠全部空白为单空格。幂等。 */
export declare function normalizePersonaLine(input: unknown): string;
export declare function twinWarn(...args: unknown[]): void;
/** $DSH_HOME 解析（env 优先，回退 ~/.dsh） */
export declare function dshHome(): string;
/** 旧 twin-config.json 路径（读取迁移回退用） */
export declare function legacyConfigPath(): string;
export declare function configExists(path: string): boolean;
export declare function readText(path: string): string;
