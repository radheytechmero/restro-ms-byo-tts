import { OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { restaurantSchema } from "../../types";

export class RestaurantFetchByPhone extends OpenAPIRoute {
    schema = {
        tags: ["Restaurant"],
        summary: "Fetch Restaurant by Phone Number",
        request: {
            params: z.object({
                phone: Str({ description: "Restaurant phone number" }),
            }),
        },
        responses: {
            "200": {
                description: "Returns the Restaurant",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            data: restaurantSchema,
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
            "400": {
                description: "Invalid phone number format",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.literal(false),
                            error: z.string(),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const { params } = await this.getValidatedData<typeof this.schema>();
            const { phone } = params;

            const prisma = c.get("prisma");

            // Validate phone number format (basic validation)
            if (!phone || phone.trim().length === 0) {
                return c.json(
                    {
                        success: false,
                        error: "Phone number is required",
                    },
                    400
                );
            }

            const restaurant = await prisma.restaurant.findFirst({
                where: {
                    phone
                },
            });

            if (!restaurant) {
                return c.json(
                    {
                        success: false,
                        message: "Restaurant not found with the provided phone number",
                    },
                    404
                );
            }

            return c.json({
                success: true,
                data: restaurant,
            });
        } catch (error) {
            console.error("Error fetching restaurant by phone:", error);
            return c.json(
                {
                    success: false,
                    error: "Failed to fetch restaurant",
                    detail: error instanceof Error ? error.message : String(error),
                },
                500
            );
        }
    }
}
