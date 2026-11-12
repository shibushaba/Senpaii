export function normalizeNewlines(content) {
    return content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
//# sourceMappingURL=text.js.map