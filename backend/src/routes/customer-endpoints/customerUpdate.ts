import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { updateCustomerSchema, customerSchema } from "../../types";

export class CustomerUpdate extends OpenAPIRoute {
    schema = {
        tags: ["Customer"],
        summary: "Update Customer",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: updateCustomerSchema,
                    },
                },
            },
            // params: z.object({
            //     id: Num(),
            // }),
            params: z.object({
    id: z.coerce.number(), // 👈 instead of z.number()
  }),
        },
        responses: {
            "200": {
                description: "Returns the updated Customer",
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
        const { body, params } = await this.getValidatedData<typeof this.schema>();
        const { id } = params;
        const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number

        const prisma = c.get("prisma");
        
        try {
            // Try to find the customer first
            const customer = await prisma.customer.findFirst({
                where: { 
                    id,
                    restaurantId: authenticatedRestaurantId // Ensure customer belongs to authenticated restaurant
                },
            });

            // If customer doesn't exist, return an error
            if (!customer) {
                return c.json({
                    success: false,
                    message: "Customer not found",
                }, 404);
            }

            // Update the customer with the new data
            const updatedCustomer = await prisma.customer.update({
                where: { id },
                data: body,
            });

            // Return the updated customer
            return c.json({
                success: true,
                customer: updatedCustomer,
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
                        { error: "Customer with this email already exists" },
                        409
                    );
                }
            }

            console.error("Update customer error:", error);
            return c.json(
                {
                    error: 'Failed to update customer',
                    detail: error instanceof Error ? error.message : String(error),
                },
                500
            );
        }
    }
} 