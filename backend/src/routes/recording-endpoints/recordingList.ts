import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { callRecordingSchema, callRecordingQuerySchema } from "../../types";

export class RecordingList extends OpenAPIRoute {
	schema = {
		tags: ["Recording"],
		summary: "List Call Recordings",
		security: [{ bearerAuth: [] }],
		request: {
			query: callRecordingQuerySchema,
		},
		responses: {
			"200": {
				description: "Returns a list of call recordings",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: callRecordingSchema.array(),
							pagination: z.object({
								page: z.number(),
								limit: z.number(),
								total: z.number(),
								totalPages: z.number(),
							}),
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
			const { query } = await this.getValidatedData<typeof this.schema>();
			const { page = 1, limit = 10, startDate, endDate } = query;

			// Build where clause
			const where: any = {
				restaurantId: authenticatedRestaurantId
			};

			if (startDate || endDate) {
				where.timestamp = {};
				if (startDate) {
					where.timestamp.gte = new Date(startDate);
				}
				if (endDate) {
					where.timestamp.lte = new Date(endDate);
				}
			}

			// Calculate pagination
			const skip = (page - 1) * limit;

			// Get total count for pagination
			const total = await prisma.callRecording.count({
				where
			});

			// Fetch recordings with pagination
			const recordings = await prisma.callRecording.findMany({
				where,
				include: {
					customer: {
						select: {
							id: true,
							name: true,
							phone: true,
							email: true
						}
					}
				},
				orderBy: {
					timestamp: 'desc'
				},
				skip,
				take: limit
			});

			const totalPages = Math.ceil(total / limit);

			return c.json({
				success: true,
				data: recordings,
				pagination: {
					page,
					limit,
					total,
					totalPages
				}
			});
		} catch (err) {
			console.error("Error fetching call recordings:", err)

			return c.json(
				{
					error: 'Failed to fetch call recordings',
					detail: err instanceof Error ? err.message : String(err),
				},
				500
			)
		}
	}
}
