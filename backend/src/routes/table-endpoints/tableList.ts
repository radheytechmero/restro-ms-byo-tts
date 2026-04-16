import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { tableSchema } from "../../types";

export class TableList extends OpenAPIRoute {
	schema = {
		tags: ["Table"],
		summary: "List Tables",
		// security: [{ bearerAuth: [] }],
		// request: {
		// 	query: z.object({}).optional(),
		// },
		responses: {
			"200": {
				description: "Returns a list of Tables",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: tableSchema.array(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const prisma = c.get('prisma')
		const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number

		try {
			const tables = await prisma.table.findMany({
				where: { restaurantId: authenticatedRestaurantId },
		
				orderBy: { tableNumber: 'asc' },
			});

			return c.json({
				success: true,
				data: tables,
			});
		} catch (err) {
			console.error("Error fetching tables:", err)
			return c.json(
				{
					error: 'Failed to fetch tables',
					detail: err instanceof Error ? err.message : String(err),
				},
				500
			)
		}
	}
}


