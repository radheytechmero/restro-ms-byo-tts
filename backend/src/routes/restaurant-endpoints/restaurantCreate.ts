import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { createRestaurantSchema } from "../../types";
import bcrypt from "bcryptjs";

export class RestaurantCreate extends OpenAPIRoute {
    schema = {
        tags: ["Restaurant"],
        summary: "Create a new Restaurant",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: createRestaurantSchema,
                    },
                },
                // required: true,
            },
        },
        responses: {
            "200": {
                description: "Returns the created Restaurant",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            restaurant: createRestaurantSchema,
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        // Get validated data
        const { body } = await this.getValidatedData<typeof this.schema>();
        const { password } = body
        // const data = await c.req.json();
        const prisma = c.get('prisma')

        try {

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const restaurant = await prisma.restaurant.create({
                data: {
                    ...body,
                    password: hashedPassword,
                }
            })

            // return the new task
            return c.json({
                success: true,
                restaurant
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
                        { error: "Restaurant with this email already exists" },
                        409
                    );
                }
            }

            console.error("Create restaurant error:", error);
            return c.json({ error: "Internal server error" }, 500);
        }
    }
}
