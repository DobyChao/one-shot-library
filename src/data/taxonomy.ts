/**
 * Canonical spellings for harness / model metadata. The gallery filter derives
 * its chips from actual entry data, so entries must use EXACTLY these strings
 * (listed in the 关于 page and the PR template) — "zcode" and "ZCode" would
 * otherwise become two different filter chips.
 */
export const HARNESSES = ['ZCode', 'Claude Code', 'Cursor', 'v0', 'Bolt', 'Copilot'] as const;

export const MODELS = ['GLM-5.3-Flash', 'Claude Sonnet 4.5', 'GPT-5.2', 'Gemini 3 Pro', 'Grok 4.7 High'] as const;
