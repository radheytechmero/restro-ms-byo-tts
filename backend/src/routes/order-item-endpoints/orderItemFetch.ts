import { Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { updateOrderItemSchema } from "../../types"; // Assuming this is your restaurant schema

export class OrderItemFetch extends OpenAPIRoute {
    schema = {
        tags: ["OrderItem"],
        summary: "Fetch OrderItem by Name",
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                name: Num(),
            }),
        },
        responses: {
            "200": {
                description: "Returns the OrderItem",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            restaurant: updateOrderItemSchema,
                        }),
                    },
                },
            },
            "404": {
                description: "Restaurant not found",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.literal(false),
                            message: z.string(),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        const { params } = await this.getValidatedData<typeof this.schema>();
        const { name } = params;

        const prisma = c.get("prisma");

        try {
            // const restaurant = await prisma.restaurant.findUnique({
            //     where: { id },
            // });

            // if (!restaurant) {
            //     return c.json(
            //         {
            //             success: false,
            //             message: "Restaurant not found",
            //         },
            //         404
            //     );
            // }

            return {
                success: true,
                // restaurant,
            };
        } catch (error) {
            console.error("Error fetching restaurant:", error);
            return c.json(
                {
                    error: "Failed to fetch restaurant",
                    detail: error instanceof Error ? error.message : String(error),
                },
                500
            );
        }
    }
}
