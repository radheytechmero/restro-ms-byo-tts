import { verifyJWT } from "../lib/jwt";
import { MiddlewareHandler } from "hono";
import { isPublicApiRoute } from "./public-routes";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
    if (isPublicApiRoute(c.req.path)) {
        await next();
        return;
    }

    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const parts = authHeader.split(" ");
    const token = parts[1];


    if (!token) {
        return c.json({ error: "Token missing" }, 401);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error("JWT_SECRET is not set in the environment.");
        return c.json({ error: "Server misconfiguration" }, 500);
    }
    const payload = await verifyJWT(token, jwtSecret);

    if (!payload) {
        return c.json({ error: "Invalid or expired token" }, 401);
    }

    c.set("user", payload); // Attach user info to context
    const prisma = c.get('prisma')

    if (prisma) {
        try {
            const restro = await prisma.restaurant.findUnique({
                where: { id: payload.restaurantId, status: "active" },
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            });

            if (!restro) {
                return c.json({ error: 'Restaurant not found' }, 401);
            }

        } catch (error) {
            console.error('Error fetching user from database:', error);
            return c.json({ error: 'Database error' }, 500);
        }
    }
    await next();
};
