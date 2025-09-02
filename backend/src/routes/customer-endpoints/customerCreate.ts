import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { createCustomerSchema, customerSchema } from "../../types";

export class CustomerCreate extends OpenAPIRoute {
    schema = {
        tags: ["Customer"],
        summary: "Create a new Customer",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: createCustomerSchema,
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Returns the created Customer",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            customer: customerSchema,
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        // Get validated data
        const { body } = await this.getValidatedData<typeof this.schema>();
        const prisma = c.get('prisma')
        const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number

        try {
            // Ensure the customer is created for the authenticated restaurant
            const customer = await prisma.customer.create({
                data: {
                    ...body,
                    restaurantId: authenticatedRestaurantId,
                }
            })

            // return the new customer
            return c.json({
                success: true,
                customer
            });
        } catch (error: unknown) {
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

            console.error("Create customer error:", error);
            return c.json({ error: "Internal server error" }, 500);
        }
    }
}
