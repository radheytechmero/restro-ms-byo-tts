import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { customerSchema } from "../../types";

export class CustomerFetch extends OpenAPIRoute {
    schema = {
        tags: ["Customer"],
        summary: "Fetch Customer by ID",
        security: [{ bearerAuth: [] }],
        request: {
            // params: z.object({
            //     id: Num(),
            // }),
            params: z.object({
    id: z.coerce.number(), // 👈 instead of z.number()
  }),
        },
        responses: {
            "200": {
                description: "Returns the Customer",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            customer: customerSchema,
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

            return c.json({
                success: true,
                customer,
            });
        } catch (error) {
            console.error("Error fetching customer:", error);
            return c.json(
                {
                    error: "Failed to fetch customer",
                    detail: error instanceof Error ? error.message : String(error),
                },
                500
            );
        }
    }
} 