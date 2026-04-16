import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { customerCron, menuCron } from "./cron";


// Simple secured cron endpoint that updates some data every run
export class CronUpdate extends OpenAPIRoute {
    schema = {
        tags: ["Cron"],
        summary: "Cron-triggered DB update",
        request: {
            headers: z.object({
                "x-cron-key": z.string(),
            }),
        },
        responses: {
            "200": {
                description: "Cron run executed",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            updated: z.number().optional(),
                        }),
                    },
                },
            },
            "401": {
                description: "Unauthorized",
                content: {
                    "application/json": {
                        schema: z.object({ success: Bool() }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        const prisma = c.get("prisma");
        const req = c.req;
        const cronKey = req.header("x-cron-key");
        const expectedKey = process.env.CRON_SECRET_KEY || "local-cron-key";
        
        if (!cronKey || cronKey !== expectedKey) {
            return c.json({ success: false }, 401);
        }

        const restaurants = await prisma.restaurant.findMany({
            where: {
                role: {
                    not: 'superadmin'
                }
            }
        })

        for (const e of restaurants) {
            if(e.mid && e.token){
                customerCron(prisma, e.id, e.mid, e.token)
                menuCron(prisma, e.id, e.mid, e.token)
            }
        }




        // Example job: mark old pending orders (>60 minutes) as expired
        // const cutoff = new Date(Date.now() - 60 * 60 * 1000);
        // // console.log(`[cron] Running DB update. Cutoff: ${cutoff.toISOString()}`);
        // const result = await prisma.order.updateMany({
        //     where: { status: "pending", createdAt: { lt: cutoff } },
        //     data: { status: "expired" },
        // });
        // console.log(`[cron] Updated rows: ${result.count}`);
        return c.json({ success: true});
    }
}


