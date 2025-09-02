import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { restaurantSchema } from "../../types";

export class RestaurantList extends OpenAPIRoute {
	schema = {
		tags: ["Restaurant"],
		summary: "List Restaurant",
		security: [{ bearerAuth: [] }],
		responses: {
			"200": {
				description: "Returns a list of Restaurant",
				content: {
					"application/json": {
						schema: z.object({
							// series: z.object({
								success: Bool(),
								// result: z.object({
									data: restaurantSchema.array(),
								// }),
							}),
						// }),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const prisma = c.get('prisma')
		const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number
		
		try {
			// Only return the authenticated restaurant's data
			const restaurant = await prisma.restaurant.findMany()
			// const restaurant = await prisma.restaurant.findUnique({
			// 	where: { id: authenticatedRestaurantId }
			// })

			if (!restaurant) {
				return c.json({
					success: false,
					message: "Restaurant not found",
				}, 404);
			}

			return c.json({
				success: true,
				data: restaurant
			});
		} catch (err) {
			console.error("Error fetching restaurant:", err)

			return c.json(
				{
					error: 'Failed to fetch restaurant',
					detail: err instanceof Error ? err.message : String(err),
				},
				500
			)
		}
	}
}
