import { Bool, Num, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { menuItemSchema } from "../../types";

export class MenuItemList extends OpenAPIRoute {
	schema = {
		tags: ["MenuItem"],
		summary: "List MenuItem",
		// security: [{ bearerAuth: [] }],
		request: {
			query: z.object({
				no: Str().optional(),
				restaurantId: Str().optional(),
			}),
		},
		responses: {
			"200": {
				description: "Returns a list of MenuItem",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: menuItemSchema.array(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {

		const prisma = c.get('prisma')
		const { query } = await this.getValidatedData<typeof this.schema>();
		const { no, restaurantId } = query
		try {


			let restaurantMenuItems;
			let id = parseInt(restaurantId || "0");
			console.log(id, "As");


			if (no) {
				const restro = await prisma.restaurant.findFirst({
					where: { phone: no },
					select: { id: true, name: true },
				});

				if (!restro) {
					return c.json({
						success: false,
						message: "Restaurant with this phone number not found",
					}, 404);
				}

				restaurantMenuItems = await prisma.menuItem.findMany({
					where: { restaurantId: restro.id },
				});
			} else {
				restaurantMenuItems = await prisma.menuItem.findMany(
					{
						where: { restaurantId: id },
					}
				);
			}

			return c.json({
				success: true,
				data: restaurantMenuItems,
			});
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
