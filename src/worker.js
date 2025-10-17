export default {
    async fetch(request) {
        return handleRequest(request);
    },
};

async function handleRequest(request) {
    const cacheKey = request.url; // キャッシュキー

    // 1. キャッシュストアの取得
    const cache = caches.default;

    // 2. キャッシュのチェック
    let response = await cache.match(cacheKey);

    if (response) {
        // 3. キャッシュヒット
        // 適切なヘッダーを追加して応答を返す（CF-Cache-StatusはWorkersのCache APIでは自動付与されないが、デバッグ用としてX-Cache-Statusなどを付与可能）
        console.log("Cache HIT");
        return response;
    }

    // 4. キャッシュミス
    console.log("Cache MISS, fetching from Astro SSR");

    // ここでAstroのSSR処理を実行し、レスポンスを取得する
    // (例: const response = await astroApp.fetch(request, env, context);)

    // --- Astro SSR処理が応答を生成したとする ---
    // 例としてダミーの応答を生成
    const headers = new Headers();
    headers.set("Content-Type", "text/html");
    headers.set(
        "Cache-Control",
        "public, s-maxage=31536000, max-age=31536000, stale-while-revalidate=10"
    ); // Astro側で設定されたヘッダー
    response = new Response("<html>...</html>", { headers });
    // ----------------------------------------

    // 5. キャッシュに保存
    // レスポンスのCache-Controlヘッダーに基づき、WorkersのCache APIがキャッシュ期間を決定します
    request.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
}
