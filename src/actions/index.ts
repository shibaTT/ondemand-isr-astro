import { defineAction } from "astro:actions";

export const server = {
    generatePage: defineAction({
        handler: async () => {
            // CloudflareにAPIを送ってページをパージする
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${import.meta.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${import.meta.env.CLOUDFLARE_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        files: [`${import.meta.env.PUBLIC_PURGE_URL}`],
                    }),
                }
            );

            if (!response.ok) {
                return await response.json();
            }

            return await response.json();
        },
    }),
};
