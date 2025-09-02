import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { orderItemSchema } from "../../types";

export class OrderItemList extends OpenAPIRoute {
	schema = {
		tags: ["OrderItem"],
		summary: "List Order",
		security: [{ bearerAuth: [] }],
		responses: {
			"200": {
				description: "Returns a list of Order",
				content: {
					"application/json": {
						schema: z.object({
							// series: z.object({
								success: Bool(),
								// result: z.object({
									data: orderItemSchema.array(),
								// }),
							}),
						// }),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		// Get validated data
		// const data = await this.getValidatedData<typeof this.schema>();
		const prisma = c.get('prisma')
		try {
			const orderItem = await prisma.orderItem.findMany()

			return {
				success: true,
				data: orderItem
			};
		} catch (err) {
			console.error("Error fetching orders:", err)

			return c.json(
				{
					error: 'Failed to fetch orders',
					detail: err instanceof Error ? err.message : String(err),
				},
				500
			)
		}
	}
}
