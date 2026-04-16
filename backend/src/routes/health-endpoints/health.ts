import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class HealthRoute extends OpenAPIRoute {
    schema = {
        tags: ["Health"],
        summary: "API health check",
        responses: {
            "200": {
                description: "Backend API is healthy",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            status: z.literal("ok"),
                            timestamp: z.string(),
                        }),
                    },
                },
            },
        },
    };

    async handle(c) {
        return c.json({
            success: true,
            status: "ok",
            timestamp: new Date().toISOString(),
        });
    }
}
