// ビルドされたAstro Workerをインポート
import worker from "../dist/_worker.js/index.js";

async function handleRequest(request, env, context) {
    // Cache APIはGETリクエストのみサポート
    if (request.method !== "GET") {
        return worker.fetch(request, env, context);
    }

    // 1. キャッシュストアの取得
    const cache = caches.default;

    // 2. キャッシュキーの作成
    const cacheKey = new Request(request.url, {
        method: "GET",
        headers: request.headers,
    });

    // 3. キャッシュのチェック
    let response = await cache.match(cacheKey);

    if (response) {
        // 4. キャッシュヒット
        console.log("Cache HIT:", request.url);
        // デバッグ用ヘッダーを追加
        const newResponse = new Response(response.body, response);
        newResponse.headers.set("X-Cache-Status", "HIT");
        return newResponse;
    }

    // 5. キャッシュミス - Astro SSRで生成
    console.log("Cache MISS, fetching from Astro SSR:", request.url);

    // AstroのSSRハンドラーを呼び出し
    response = await worker.fetch(request, env, context);

    // 6. 成功したHTMLレスポンスのみキャッシュ
    if (response.ok && response.headers.get("Content-Type")?.includes("text/html")) {
        // Cache-Controlヘッダーを設定（必要に応じてAstro側でも設定可能）
        const cachedResponse = new Response(response.body, response);
        cachedResponse.headers.set(
            "Cache-Control",
            "public, s-maxage=31536000, max-age=31536000, stale-while-revalidate=10"
        );
        cachedResponse.headers.set("X-Cache-Status", "MISS");

        // 7. キャッシュに保存（非同期処理）
        context.waitUntil(cache.put(cacheKey, cachedResponse.clone()));

        return cachedResponse;
    }

    // その他のレスポンス（エラーなど）はキャッシュしない
    return response;
}

export default {
    async fetch(request, env, context) {
        return handleRequest(request, env, context);
    },
};
