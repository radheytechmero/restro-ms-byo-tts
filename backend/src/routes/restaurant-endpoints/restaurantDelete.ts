import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";

export class RestaurantDelete extends OpenAPIRoute {
    schema = {
        tags: ["Restaurant"],
        summary: "Delete Restaurant by ID",
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: Num(),
            }),
        },
        responses: {
            "200": {
                description: "Successfully deleted",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            message: z.string(),
                        }),
                    },
                },
            },
            "404": {
                description: "Restaurant not found",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            message: z.string(),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        const { params } = await this.getValidatedData<typeof this.schema>();
        const { id } = params;

        const prisma = c.get("prisma");

        try {
            const restaurant = await prisma.restaurant.findUnique({
                where: { id },
            });

            if (!restaurant) {
                return c.json(
                    {
                        success: false,
                        message: "Restaurant not found",
                    },
                    404
                );
            }

            await prisma.restaurant.delete({
                where: { id },
            });

            return {
                success: true,
                message: "Restaurant deleted successfully",
            };
        } catch (error) {
            console.error("Error deleting restaurant:", error);
            return c.json(
                {
                    error: "Failed to delete restaurant",
                    detail: error instanceof Error ? error.message : String(error),
                },
                500
            );
        }
    }
}
