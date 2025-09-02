import { OpenAPIRoute } from "chanfana";
import { signJWT, type CustomJWTPayload } from "../../lib/jwt";
import { loginSchema } from "../../types";
import { z } from "zod";
import bcrypt from "bcryptjs";

export class LoginRoute extends OpenAPIRoute {
    schema = {
        tags: ["Auth"],
        summary: "Login",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: loginSchema,
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Login successful",
                content: {
                    "application/json": {
                        schema: z.object({
                            token: z.string(),
                            user: z.object({
                                id: z.string(),
                                email: z.string(),
                                name: z.string().optional(),
                            }),
                        }),
                    },
                },
            },
            "401": {
                description: "Invalid credentials",
                content: {
                    "application/json": {
                        schema: z.object({
                            error: z.string(),
                        }),
                    },
                },
            },
            "400": {
                description: "Bad request",
                content: {
                    "application/json": {
                        schema: z.object({
                            error: z.string(),
                        }),
                    },
                },
            },
        },
    };

    async handle(c) {
        try {
            const { body } = await this.getValidatedData<typeof this.schema>();
            const { email, password } = body;

            // Initialize Prisma client
            const prisma = c.get('prisma');

            try {
                // Validate user credentials
                const user = await this.validateUser(email, password, prisma);

                if (!user) {
                    return c.json(
                        { error: "Invalid email or password" },
                        401
                    );
                }

                // Generate JWT token
                const payload: CustomJWTPayload = {
                    restaurantId: user.id,
                    email: user.email,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
                };

                // console.log(c.env.JWT_SECRET,c.env.DATABASE_URL,"Ad");
                const jwtSecret = process.env.JWT_SECRET;
                if (!jwtSecret) {
                    console.error("JWT_SECRET is not set in the environment.");
                    return c.json({ error: "Server misconfiguration" }, 500);
                }
                const token = await signJWT(payload, jwtSecret);

                return c.json({
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    },
                });

            } finally {
                // Always disconnect Prisma client
                await prisma.$disconnect();
            }

        } catch (error) {
            console.error("Login error:", error);
            return c.json(
                { error: "Internal server error" },
                500
            );
        }
    }

    // Validate user credentials using Prisma
    private async validateUser(email: string, password: string, prisma) {
        try {
            // Find user by email
            const restro = await prisma.restaurant.findUnique({
                where: {
                    email: email.toLowerCase().trim(),
                }
                // select: {
                //     id: true,
                //     email: true,
                //     name: true,
                //     password: true, // Make sure this field exists in your restro model
                //     status: true, // Optional: if you have account status
                // },
            });

            if (!restro) {
                return null;
            }

            // Check if account is active (optional)
            if (restro.status === false) {
                return null;
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, restro.password);

            if (!isValidPassword) {
                return null;
            }

            // Return user without password
            return {
                id: restro.id,
                email: restro.email,
                name: restro.name,
                role: restro.role
            };

        } catch (error) {
            console.error("User validation error:", error);
            return null;
        }
    }
}