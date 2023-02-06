import { NodeHtmlMarkdown } from "node-html-markdown";

export function htmlToMarkdown(htmlContent: string) {
  return NodeHtmlMarkdown.translate(htmlContent, {
    bulletMarker: "•",
  });
}
