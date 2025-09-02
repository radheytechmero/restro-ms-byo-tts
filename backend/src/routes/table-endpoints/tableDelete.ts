import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";

export class TableDelete extends OpenAPIRoute {
	schema = {
		tags: ["Table"],
		summary: "Delete Table by ID",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: Num(),
			}),
		},
		responses: {
			"200": {
				description: "Successfully deleted",
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
		const { params } = await this.getValidatedData<typeof this.schema>();
		const { id } = params;
		const prisma = c.get("prisma");

		try {
			const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number

			const table = await prisma.table.findUnique({ where: { id } });
			if (!table) {
				return c.json({ success: false, message: "Table not found" }, 404);
			}

			if (table.restaurantId !== authenticatedRestaurantId) {
				return c.json({ success: false, message: "Forbidden - You can only delete your own tables" }, 403);
			}

			// Prevent deletion if table is referenced by active orders or reservations
			const hasOrders = await prisma.order.count({ where: { tableId: id } });
			const hasReservations = await prisma.reservation.count({ where: { tableId: id } });
			if (hasOrders > 0 || hasReservations > 0) {
				return c.json({ success: false, message: "Cannot delete table with existing orders or reservations" }, 400);
			}

			await prisma.table.delete({ where: { id } });
			return c.json({ success: true, message: "Table deleted successfully" });
		} catch (error) {
			console.error("Error deleting table:", error);
			return c.json({
				error: "Failed to delete table",
				detail: error instanceof Error ? error.message : String(error),
			}, 500);
		}
	}
}


