const publicExactRoutes = new Set([
    "/api/login",
    "/api/twilio",
    "/api/recording",
    "/api/cron/update",
    "/api/health",
    "/api/menu-items",
    "/api/create-order",
    "/api/customers",
]);

const publicRoutePrefixes = [
    "/api/restaurant/",
];

export const isPublicApiRoute = (path: string) => {
    if (publicExactRoutes.has(path)) {
        return true;
    }

    return publicRoutePrefixes.some((prefix) => path.startsWith(prefix));
};
