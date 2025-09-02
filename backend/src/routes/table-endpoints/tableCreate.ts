import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { createTableSchema } from "../../types";

export class TableCreate extends OpenAPIRoute {
	schema = {
		tags: ["Table"],
		summary: "Create a new Table",
		security: [{ bearerAuth: [] }],
		request: {
			body: {
				content: {
					"application/json": {
						schema: createTableSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Returns the created Table",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							table: createTableSchema,
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const { body } = await this.getValidatedData<typeof this.schema>();
		const prisma = c.get('prisma')

		try {
			const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number
			const tableData = { ...body, restaurantId: authenticatedRestaurantId };

			const table = await prisma.table.create({ data: tableData });

			return c.json({
				success: true,
				table,
			});
		} catch (error: unknown) {
			console.error("Create table error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}
}


