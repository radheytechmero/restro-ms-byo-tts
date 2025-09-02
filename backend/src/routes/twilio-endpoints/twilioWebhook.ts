import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import querystring from 'querystring';
import parsePhoneNumber from 'libphonenumber-js';

function getNationalNumber(phone: unknown): string | undefined {
    if (typeof phone === 'string') {
        const phno = parsePhoneNumber(phone, 'US');
        return phno ? phno.countryCallingCode + phno.nationalNumber : phone;
    }
    return undefined;
}

export let restaurantNo: any = null;

export class TwilioWebhookRoute extends OpenAPIRoute {
    schema = {
        tags: ["Twilio"],
        summary: "Twilio webhook for incoming calls",
        request: {
            body: {
                content: {
                    "application/x-www-form-urlencoded": {
                        schema: z.string().describe("URL-encoded form data from Twilio"),
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Twilio webhook response",
                content: {
                    "application/xml": {
                        schema: z.string(),
                    },
                },
            },
            "400": {
                description: "Bad request",
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

    async handle(c) {
        try {
            // Get the raw body as text since Twilio sends URL-encoded form data
            const rawBody = await c.req.text();
            console.log("Hello - Twilio POST received");

            // Parse the URL-encoded form data
            const parsedBody = querystring.parse(rawBody);
            console.log("Parsed body:", parsedBody);


            // Get the current server URL dynamically
            const host = c.req.header('host') || 'localhost:443';
            const protocol = c.req.header('x-forwarded-proto') || 'https';
            const wsUrl = `${protocol === 'https' ? 'wss' : 'ws'}://${host}`;
            
            // Respond to Twilio immediately
            // <Stream url="${wsUrl}"/>
            const twilioResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
   <Connect>
      <Stream url="wss://q6f1bmhp-443.inc1.devtunnels.ms"/>
   </Connect>
</Response>`;
            
            console.log('Twilio response:', twilioResponse);
            
            // Return XML response
            return new Response(twilioResponse, {
                status: 200,
                headers: {
                    'Content-Type': 'application/xml',
                },
            });

        } catch (error) {
            console.error("Twilio webhook error:", error);
            return c.json(
                { error: "Internal server error" },
                500
            );
        }
    }
} 