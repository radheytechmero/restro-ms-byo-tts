import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { updateCategorySchema } from "../../types";

export class CategoryUpdate extends OpenAPIRoute {
    schema = {
        tags: ["Category"],
        summary: "Update Category",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: updateCategorySchema,
                    },
                },
            },
            params: z.object({
                id: Num(),
            }),
        },
        responses: {
            "200": {
                description: "Returns the updated Category",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            category: updateCategorySchema,
                        }),
                    },
                },
            },
            "404": {
                description: "Category not found",
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
        const { body, params } = await this.getValidatedData<typeof this.schema>();
        const { id } = params;

        const prisma = c.get("prisma");
        try {
            const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number
            
            // Try to find the category first and validate restaurant access
            const category = await prisma.category.findUnique({
                where: { id },
            });

            // If category doesn't exist, return an error
            if (!category) {
                return c.json({
                    success: false,
                    message: "Category not found",
                }, 404);
            }

            // Validate that the category belongs to the authenticated restaurant
            if (category.restaurantId !== authenticatedRestaurantId) {
                return c.json({
                    success: false,
                    message: "Forbidden - You can only update your own categories",
                }, 403);
            }

            // Update the category with the new data
            const updatedCategory = await prisma.category.update({
                where: { id },
                data: body,
            });

            // Return the updated category
            return c.json({
                success: true,
                category: updatedCategory,
            });
        } catch (error) {
            console.error("Update category error:", error);
            return c.json(
                {
                    error: 'Failed to update category',
                    detail: error instanceof Error ? error.message : String(error),
                },
                500
            );
        }
    }
} 