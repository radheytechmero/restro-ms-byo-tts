import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { callRecordingSchema, createCallRecordingSchema } from "../../types";

export class RecordingCreate extends OpenAPIRoute {
	schema = {
		tags: ["Recording"],
		summary: "Create Call Recording",
		security: [{ bearerAuth: [] }],
		request: {
			body: {
				content: {
					"application/json": {
						schema: createCallRecordingSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Call recording created successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: callRecordingSchema,
						}),
					},
				},
			},
			"400": {
				description: "Invalid input data",
				content: {
					"application/json": {
						schema: z.object({
							error: z.string(),
							detail: z.string().optional(),
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
			const { body } = await this.getValidatedData<typeof this.schema>();
			const { customerId, recordingUrl } = body;

			// If customerId is provided, verify the customer exists and belongs to the restaurant
			if (customerId) {
				const customer = await prisma.customer.findFirst({
					where: {
						id: customerId,
						restaurantId: authenticatedRestaurantId
					}
				});

				if (!customer) {
					return c.json(
						{
							error: 'Customer not found or does not belong to this restaurant'
						},
						400
					);
				}
			}

			const recording = await prisma.callRecording.create({
				data: {
					customerId: customerId || null,
					recordingUrl,
					restaurantId: authenticatedRestaurantId,
				}
			});

			return c.json({
				success: true,
				data: recording
			}, 201);
		} catch (err) {
			console.error("Error creating call recording:", err)

			return c.json(
				{
					error: 'Failed to create call recording',
					detail: err instanceof Error ? err.message : String(err),
				},
				500
			)
		}
	}
}
