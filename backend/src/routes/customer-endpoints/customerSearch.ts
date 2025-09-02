import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { customerSchema } from "../../types";

export class CustomerSearch extends OpenAPIRoute {
	schema = {
		tags: ["Customer"],
		summary: "Search Customer by Phone and Restaurant",
		// security: [{ bearerAuth: [] }],
		request: {
			query: z.object({
				phone: z.string().min(1, "Phone number is required"),
				restaurantNo: z.string().min(1, "Restaurant number is required"),
			}),
		},
		responses: {
			"200": {
				description: "Returns the found Customer",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							customer: customerSchema.optional(),
							message: z.string().optional(),
						}),
					},
				},
			},
			// "404": {
			// 	description: "Customer not found",
			// 	content: {
			// 		"application/json": {
			// 			schema: z.object({
			// 				success: Bool(),
			// 				message: z.string(),
			// 			}),
			// 		},
			// 	},
			// },
		},
	};

	async handle(c: AppContext) {
		const { query } = await this.getValidatedData<typeof this.schema>();
		const { phone, restaurantNo } = query;

		const prisma = c.get('prisma')
		
		try {
			// First find the restaurant by restaurant number
			const restaurant = await prisma.restaurant.findFirst({
				where: { 
					phone: restaurantNo
				}
			});

			if (!restaurant) {
				return c.json({
					success: false,
					message: "Restaurant not found",
				}, 200);
			}

			// console.log(restaurant, phone,"Ad");
			

			// Then find the customer by phone number in that restaurant
			const customer = await prisma.customer.findFirst({
				where: { 
					phone: phone,
					restaurantId: restaurant.id
				}
			});

			// console.log(customer,"asdasds");
			

			if (!customer) {
				return c.json({
					success: false,
					message: "Customer not found",
				}, 200);
			}

			return c.json({
				success: true,
				customer: customer
			});
		} catch (err) {
			console.error("Error searching customer:", err)

			return c.json(
				{
					error: 'Failed to search customer',
					detail: err instanceof Error ? err.message : String(err),
				},
				500
			)
		}
	}
} 