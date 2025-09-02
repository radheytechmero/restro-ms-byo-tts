import { MiddlewareHandler } from "hono";

export const restaurantScopeMiddleware: MiddlewareHandler = async (c, next) => {
    const user = c.get("user");
    
    if (!user || !user.restaurantId) {
        return c.json({ error: "Unauthorized - No restaurant context" }, 401);
    }

    const authenticatedRestaurantId = user.restaurantId;
    const requestUrl = c.req.url;
    const method = c.req.method;

    // Extract restaurant ID from different sources based on endpoint
    // let requestedRestaurantId: number | null = null;

    // Check query parameters for restaurantId
    // const queryRestaurantId = c.req.query("restaurantId");
    // if (queryRestaurantId) {
    //     requestedRestaurantId = parseInt(queryRestaurantId);
    // }

    // Check URL parameters for restaurant ID patterns
    // const urlParams:any = c.req.param();
    // if (urlParams && urlParams.id) {
    //     // For endpoints that might have restaurant ID in the path
    //     const pathId = parseInt(urlParams.id);
    //     if (!isNaN(pathId)) {
    //         // Check if this is a restaurant-specific endpoint
    //         if (requestUrl.includes('/restaurant/') || 
    //             requestUrl.includes('/fetch-restaurant/') || 
    //             requestUrl.includes('/update-restaurant/') || 
    //             requestUrl.includes('/delete-restaurant/')) {
    //             requestedRestaurantId = pathId;
    //         }
    //     }
    // }

    // Check request body for restaurantId (for POST/PUT requests)
    // Note: We don't consume the body here to avoid conflicts with route handlers
    // Restaurant ID validation will be handled in individual route handlers if needed

    // If a restaurant ID is requested, validate it matches the authenticated restaurant
    // if (requestedRestaurantId !== null && requestedRestaurantId !== authenticatedRestaurantId) {
    //     return c.json({ 
    //         error: "Forbidden - You can only access your own restaurant data",
    //         detail: `Authenticated restaurant ID: ${authenticatedRestaurantId}, Requested restaurant ID: ${requestedRestaurantId}`
    //     }, 403);
    // }

    // Set the validated restaurant ID in context for use in endpoints
    c.set("authenticatedRestaurantId", authenticatedRestaurantId);
    
    await next();
};

// Helper function to get authenticated restaurant ID from context
export const getAuthenticatedRestaurantId = (c: any): number => {
    return c.get("authenticatedRestaurantId");
};

// Helper function to validate restaurant access for a specific resource
export const validateRestaurantAccess = (c: any, resourceRestaurantId: number): boolean => {
    const authenticatedRestaurantId = getAuthenticatedRestaurantId(c);
    return authenticatedRestaurantId === resourceRestaurantId;
}; 