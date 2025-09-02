import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { placeOrderSchema, orderSchema } from "../../types";
import parsePhoneNumber from 'libphonenumber-js'
import { createCloverCustomer, createCloverOrder } from "./clover-order";


export class OrderCreate extends OpenAPIRoute {
    schema = {
        tags: ["Order"],
        summary: "Create a new Order",
        // security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: placeOrderSchema,
                    },
                },
                // required: true,
            },
        },
        responses: {
            "200": {
                description: "Returns the created Order",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            data: orderSchema,
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        // Get validated data
        const { body } = await this.getValidatedData<typeof this.schema>();
        // const data = await c.req.json();
        const prisma = c.get('prisma')

        try {

            let {
                customerEmail,
                customerName,
                customerPhone,
                restaurantNo,
                orderItems,
                orderType,
                tableNumber,
                deliveryAddress,
                specialRequests,
                isConfirmed
            } = body

            // return

            let payload: any = {}
            let customerUID
            const restro = await prisma.restaurant.findFirst({
                where: { phone: restaurantNo }
            })
            if(restro){
                const customer = await prisma.customer.findFirst({
                    where: { phone: customerPhone, restaurantId: restro.id }
                })
                if (!customer) {

                        let cloverCustomer = await createCloverCustomer(restro.mid, restro.token, customerName, customerPhone)

                        // let phno:any = parsePhoneNumber(customerPhone, 'US')
                        const add = await prisma.customer.create({
                            data: {
                                restaurantId: restro.id,
                                customerUID: cloverCustomer.id,
                                name: customerName,
                                email: customerEmail,
                                phone: customerPhone
                            }
                        })
                        payload.customerId = add.id
                        customerUID = add.customerUID
                        payload.restaurantId = restro.id
                    
                } else {
                    payload.customerId = customer.id
                    customerUID = customer.customerUID
                    payload.restaurantId = customer.restaurantId
                }
            }


            // Calculate total amount
            const totalAmount = orderItems.reduce((sum: number, item: any) => {
                return sum + (item.price || 0) * (item.quantity || 0);
            }, 0);

            // Prepare order data with enhanced fields
            const orderData = {
                ...payload,
                customerName,
                customerPhone,
                customerEmail,
                orderType,
                specialRequests: specialRequests || null,
                isConfirmed,
                totalAmount
            }

            // Add delivery address if provided
            if (deliveryAddress) {
                orderData.deliveryAddressStreet = deliveryAddress.street;
                orderData.deliveryAddressCity = deliveryAddress.city;
                orderData.deliveryAddressZipCode = deliveryAddress.zipCode;
                orderData.deliverySpecialInstructions = deliveryAddress.specialInstructions;
            }

            // Add table number if provided for dine-in orders
            if (tableNumber && orderType === 'dine-in') {
                // Find table by table number
                const table = await prisma.table.findFirst({
                    where: {
                        tableNumber: tableNumber,
                        restaurantId: payload.restaurantId
                    }
                });
                if (table) {
                    orderData.tableId = table.id;
                } else {
                    // If table not found, find the first available table for this restaurant
                    const firstAvailableTable = await prisma.table.findFirst({
                        where: {
                            restaurantId: payload.restaurantId,
                            status: "available"
                        }
                    });
                    if (firstAvailableTable) {
                        orderData.tableId = firstAvailableTable.id;
                    }
                    // If no table is available, don't set tableId (it's optional in schema)
                }
            }
            // console.log(orderData,"Asd");


            const order = await prisma.order.create({
                data: orderData
            })

            // Create order items with enhanced fields
            for (const element of orderItems) {
                const orderItemData: any = {
                    orderId: order.id,
                    menuItemId: element.id,
                    quantity: element.quantity,
                    price: element.price,
                    notes: element.notes || null
                }

                // Add size if provided and not null
                if (element.size && element.size !== null) {
                    orderItemData.size = element.size;
                }

                // Add customizations if provided and not null/empty
                if (element.customizations && element.customizations.length > 0) {
                    orderItemData.customizations = JSON.stringify(element.customizations);
                }

                await prisma.orderItem.create({
                    data: orderItemData
                })
            }

            console.log(body,"Asd");
            
            createCloverOrder(restro?.mid,restro?.token, orderItems, customerUID)
            // return the new task
            return c.json({
                success: true,
                data: order
            });
        } catch (error: unknown) {
            console.error("Create restaurant error:", error);
            return c.json({ error: "Internal server error" }, 500);
        }
    }
}
