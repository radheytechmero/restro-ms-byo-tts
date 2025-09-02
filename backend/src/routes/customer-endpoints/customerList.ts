import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { customerSchema } from "../../types";

export class CustomerList extends OpenAPIRoute {
	schema = {
		tags: ["Customer"],
		summary: "List Customers",
		security: [{ bearerAuth: [] }],
		responses: {
			"200": {
				description: "Returns a list of Customers",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: customerSchema.array(),
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
			// Only return customers for the authenticated restaurant
			const customers = await prisma.customer.findMany({
				where: { 
					restaurantId: authenticatedRestaurantId 
				},
				orderBy: {
					createdAt: 'desc'
				}
			})

			return c.json({
				success: true,
				data: customers
			});
		} catch (err) {
			console.error("Error fetching customers:", err)

			return c.json(
				{
					error: 'Failed to fetch customers',
					detail: err instanceof Error ? err.message : String(err),
				},
				500
			)
		}
	}
}
