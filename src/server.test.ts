import { describe, it, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { server } from "./server.js";

describe("url2markdown", () => {
  it("サイトの中身をMarkdownで返す", async () => {
    // テスト用クライアントの作成
    const client = new Client({
      name: "test client",
      version: "0.1.0",
    });

    // インメモリ通信チャネルの作成
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    // クライアントとサーバーを接続
    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);

    // ツールにURLを渡して実行する
    const result = await client.callTool({
      name: "url2Markdown",
      arguments: {
        url: "https://sori883.dev/privacypolicy/",
      },
    });

    console.log(result);

    // 該当のサイト本文がMarkdownで取得出来ているか確認
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: expect.stringContaining("## プライバシーポリシー")
        },
      ],
    });
  });
});
