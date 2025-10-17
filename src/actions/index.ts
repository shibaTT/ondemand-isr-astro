import { defineAction } from "astro:actions";
import { z } from "astro:schema";

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
                        files: ["https://ondemand-isr-astro.torisan.workers.dev"],
                    }),
                }
            );

            if (!response.ok) {
                return response;
            }

            return true;
        },
    }),
};
