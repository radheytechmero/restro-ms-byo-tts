import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";

export class CustomerDelete extends OpenAPIRoute {
    schema = {
        tags: ["Customer"],
        summary: "Delete Customer by ID",
        security: [{ bearerAuth: [] }],
        request: {
           params: z.object({
    id: z.coerce.number(), // 👈 instead of z.number()
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
                description: "Customer not found",
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
        const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number

        const prisma = c.get("prisma");

        try {
            const customer = await prisma.customer.findFirst({
                where: { 
                    id,
                    restaurantId: authenticatedRestaurantId // Ensure customer belongs to authenticated restaurant
                },
            });

            if (!customer) {
                return c.json(
                    {
                        success: false,
                        message: "Customer not found",
                    },
                    404
                );
            }

            await prisma.customer.delete({
                where: { id },
            });

            return c.json({
                success: true,
                message: "Customer deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting customer:", error);
            return c.json(
                {
                    error: "Failed to delete customer",
                    detail: error instanceof Error ? error.message : String(error),
                },
                500
            );
        }
    }
} 