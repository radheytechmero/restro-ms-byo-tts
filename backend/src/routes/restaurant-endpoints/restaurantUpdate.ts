import { Num, OpenAPIRoute } from "chanfana";
import { boolean, z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { updateRestaurantSchema } from "../../types";

export class RestaurantUpdate extends OpenAPIRoute {
    schema = {
        tags: ["Restaurant"],
        summary: "Update Restaurant",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: updateRestaurantSchema,
                    },
                },
            },  
            params: z.object({
                id: Num(),
            }),
        },

        responses: {
            "200": {
                description: "Returns the updated Restaurant",
                content: {
                    "application/json": {
                        schema: z.object({
                            series: z.object({
                                success: z.boolean(),
                                restaurant: updateRestaurantSchema,
                            }),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {

        const { body, params } = await this.getValidatedData<typeof this.schema>();
        const { id } = params;
        console.log(body)
        const prisma = c.get("prisma");
        try {
            // Try to find the restaurant first
            const restaurant = await prisma.restaurant.findUnique({
                where: { id },
            });
            console.log("Found restaurant:", restaurant);

            // If restaurant doesn't exist, return an error
            if (!restaurant) {
                return {
                    success: false,
                    message: "Restaurant not found",
                };
            }

            // Update the restaurant with the new data
            const updatedRestaurant = await prisma.restaurant.update({
                where: { id },
                data: body,
            });

            // Return the updated restaurant
            return c.json({
                success: true,
                restaurant: updatedRestaurant,
            });
        } catch (error) {
            if (
                error &&
                typeof error === 'object' &&
                'code' in error &&
                'meta' in error &&
                error.code === 'P2002'
            ) {
                const prismaError = error as {
                    code: string;
                    meta?: {
                        target?: string[];
                    };
                };

                if (prismaError.meta?.target?.includes('email')) {
                    return c.json(
                        { error: "Restaurant with this email already exists" },
                        409
                    );
                }
            }

            console.error("Create restaurant error:", error);
            return c.json(
                {
                    error: 'Failed to update restaurant',
                    detail: error instanceof Error ? error.message : String(error),
                },
                500
            );
        }

    }
}
