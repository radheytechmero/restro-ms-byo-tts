// lib/jwt.ts
import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from 'jose';

export interface CustomJWTPayload {
    restaurantId: number;
    email: string;
    iat: number;
    exp: number;
}

/**
 * Sign a JWT token
 */
export async function signJWT(payload: CustomJWTPayload, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(secret);

    // Create a payload compatible with jose
    const josePayload: JoseJWTPayload = {
        ...payload,
        iat: payload.iat,
        exp: payload.exp,
    };

    return await new SignJWT(josePayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(payload.iat)
        .setExpirationTime(payload.exp)
        .sign(secretKey);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyJWT(token: string, secret: string): Promise<CustomJWTPayload | null> {
    try {
        const encoder = new TextEncoder();
        const secretKey = encoder.encode(secret);
        
        const { payload } = await jwtVerify(token, secretKey);
        
        // Validate that the payload has our required fields
        if (
            typeof payload.restaurantId === 'number' &&
            typeof payload.email === 'string' &&
            typeof payload.iat === 'number' &&
            typeof payload.exp === 'number'
        ) {
            return {
                restaurantId: payload.restaurantId,
                email: payload.email,
                iat: payload.iat,
                exp: payload.exp,
            };
        }
        
        return null;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}

/**
 * Extract JWT token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}

/**
 * Create JWT middleware for protecting routes with Prisma user lookup
 */
export function authMiddleware1(secret: string, prisma) {
    return async (c: any, next: () => Promise<void>) => {
        const authHeader = c.req.header('Authorization');
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return c.json({ error: 'Authorization token required' }, 401);
        }

        const payload = await verifyJWT(token, secret);
        if (!payload) {
            return c.json({ error: 'Invalid or expired token' }, 401);
        }

        // Add JWT payload to context
        c.set('user', payload);

        // Optionally fetch full user data from Prisma
        if (prisma) {
            try { 
                try {
                    const fullUser = await prisma.restaurant.findUnique({
                        where: { id: payload.restaurantId },
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            status: true,
                        },
                    });

                    if (!fullUser || !fullUser.isActive) {
                        return c.json({ error: 'User not found or inactive' }, 401);
                    }

                    c.set('fullUser', fullUser);
                } finally {
                    await prisma.$disconnect();
                }
            } catch (error) {
                console.error('Error fetching user from database:', error);
                return c.json({ error: 'Database error' }, 500);
            }
        }

        await next();
    };
}