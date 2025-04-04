import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import html2md from "html-to-md";

function getExtractContent(htmlContent: string) {
  const doc = new JSDOM(htmlContent);
  const article = new Readability(doc.window.document).parse();
  if (!article) {
    throw new Error("Article not found");
  }

  // @ts-ignore
  return html2md(article.content!);
}

export const server = new McpServer({
  name: "url2Markdown",
  version: "0.1.0",
});

server.tool(
  "url2Markdown", // ツールの名前
  "url to markdown", // ツールの説明
  { url: z.string().url() }, // ツールの引数を定義するスキーマ
  // ツールが呼び出されたときに実行される関数
  async ({ url }) => {
    const data = await fetch(url).then((res) => res.text());
    const md = getExtractContent(data);
    return {
      content: [{
        type: "text",
        text: md
      }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // 標準出力をするとサーバーのレスポンスとして解釈されてしまうので、標準エラー出力に出力する
  console.error("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
