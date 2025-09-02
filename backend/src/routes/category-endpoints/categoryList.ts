import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { categorySchema } from "../../types";

export class CategoryList extends OpenAPIRoute {
	schema = {
		tags: ["Category"],
		summary: "List Categories",
		security: [{ bearerAuth: [] }],
		request: {
			query: z.object({
				restaurantId: z.coerce.number().int().positive().optional(),
			}),
		},
		responses: {
			"200": {
				description: "Returns a list of Categories",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: categorySchema.array(),
						}),
					},
				},
			},
			"404": {
				description: "Restaurant not found",
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
		const prisma = c.get('prisma')
		const { query } = await this.getValidatedData<typeof this.schema>();
		const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number
		
		try {
			// Always filter by the authenticated restaurant
			const categories = await prisma.category.findMany({
				where: { restaurantId: authenticatedRestaurantId },
				orderBy: { displayOrder: 'asc' },
			});

			return c.json({
				success: true,
				data: categories,
			});
		} catch (err) {
			console.error("Error fetching categories:", err)

			return c.json(
				{
					error: 'Failed to fetch categories',
					detail: err instanceof Error ? err.message : String(err),
				},
				500
			)
		}
	}
}
