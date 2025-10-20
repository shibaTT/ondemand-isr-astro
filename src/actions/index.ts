import { defineAction } from "astro:actions";

export const server = {
    generatePage: defineAction({
        handler: async () => {
            // CloudflareにAPIを送ってページをパージする
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        files: [`${process.env.PUBLIC_PURGE_URL}`],
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
