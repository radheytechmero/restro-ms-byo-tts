import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { createCategorySchema } from "../../types";

export class CategoryCreate extends OpenAPIRoute {
    schema = {
        tags: ["Category"],
        summary: "Create a new Category",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: createCategorySchema,
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Returns the created Category",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            category: createCategorySchema,
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
        const { body } = await this.getValidatedData<typeof this.schema>();
        const prisma = c.get('prisma')

        try {
            const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number
            
            // Automatically use the authenticated restaurant ID
            const categoryData = {
                ...body,
                restaurantId: authenticatedRestaurantId
            };

            const category = await prisma.category.create({
                data: categoryData
            })

            return c.json({
                success: true,
                category
            });
        } catch (error: unknown) {
            console.error("Create category error:", error);
            return c.json({ error: "Internal server error" }, 500);
        }
    }
} 