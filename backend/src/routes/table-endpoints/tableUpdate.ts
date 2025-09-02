import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { updateTableSchema } from "../../types";

export class TableUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Table"],
		summary: "Update Table",
		security: [{ bearerAuth: [] }],
		request: {
			body: {
				content: {
					"application/json": {
						schema: updateTableSchema,
					},
				},
			},
			params: z.object({
				id: Num(),
			}),
		},
		responses: {
			"200": {
				description: "Returns the updated Table",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							table: updateTableSchema,
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const { body, params } = await this.getValidatedData<typeof this.schema>();
		const { id } = params;
		const prisma = c.get("prisma");

		try {
			const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number

			const table = await prisma.table.findUnique({ where: { id } });
			if (!table) {
				return c.json({ success: false, message: "Table not found" }, 404);
			}

			if (table.restaurantId !== authenticatedRestaurantId) {
				return c.json({ success: false, message: "Forbidden - You can only update your own tables" }, 403);
			}

			const updatedTable = await prisma.table.update({ where: { id }, data: body });

			return c.json({ success: true, table: updatedTable });
		} catch (error) {
			console.error("Update table error:", error);
			return c.json({
				error: 'Failed to update table',
				detail: error instanceof Error ? error.message : String(error),
			}, 500);
		}
	}
}


