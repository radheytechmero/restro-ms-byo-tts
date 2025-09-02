import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { callRecordingSchema } from "../../types";

export class RecordingFetch extends OpenAPIRoute {
	schema = {
		tags: ["Recording"],
		summary: "Get Call Recording by ID",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({
				id: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()),
			}),
		},
		responses: {
			"200": {
				description: "Returns a call recording",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: callRecordingSchema.extend({
								customer: z.object({
									id: z.number(),
									name: z.string(),
									phone: z.string(),
									email: z.string().nullable(),
								}).nullable(),
							}),
						}),
					},
				},
			},
			"404": {
				description: "Call recording not found",
				content: {
					"application/json": {
						schema: z.object({
							error: z.string(),
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
			const { params } = await this.getValidatedData<typeof this.schema>();
			const { id } = params;

			const recording = await prisma.callRecording.findFirst({
				where: {
					id,
					restaurantId: authenticatedRestaurantId
				},
				include: {
					customer: {
						select: {
							id: true,
							name: true,
							phone: true,
							email: true
						}
					}
				}
			});

			if (!recording) {
				return c.json(
					{
						error: 'Call recording not found'
					},
					404
				);
			}

			return c.json({
				success: true,
				data: recording
			});
		} catch (err) {
			console.error("Error fetching call recording:", err)

			return c.json(
				{
					error: 'Failed to fetch call recording',
					detail: err instanceof Error ? err.message : String(err),
				},
				500
			)
		}
	}
}
