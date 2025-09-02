import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import querystring from 'querystring';
import axios from 'axios';
import { promises as fs } from 'fs';
import { join } from 'path';
import parsePhoneNumber from 'libphonenumber-js';

export class TwilioCallRecording extends OpenAPIRoute {
    schema = {
        tags: ["Twilio"],
        summary: "Handle Twilio recording callback and download audio",
        responses: {
            "200": {
                description: "Recording processed",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            filePath: z.string().optional(),
                            mediaUrl: z.string().optional(),
                            message: z.string().optional(),
                        })
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        const prisma = c.get('prisma');
        let filePath: string | undefined;

        try {
            const rawBody = await c.req.text();
            console.log("Hello - Twilio POST received");

            // Get query parameters for customer and restaurant data
            const url = new URL(c.req.url);
            const customerPhone = url.searchParams.get('from');
            const restaurantNo = url.searchParams.get('to');
            
            console.log(`Recording callback - Customer: ${customerPhone}, Restaurant: ${restaurantNo}`);

            // Parse the URL-encoded form data
            const parsedBody = querystring.parse(rawBody);
            console.log("Parsed body:", parsedBody);
            const recordingUrl = (parsedBody.RecordingUrl as string) || '';
            const recordingSid = (parsedBody.RecordingSid as string) || '';
            const callSid = (parsedBody.CallSid as string) || '';
            const recordingDuration = (parsedBody.recordingDuration as string) || ''


            if (!recordingUrl || !recordingSid) {
                return c.json({ success: false, message: 'Missing RecordingUrl or RecordingSid' }, 400);
            }

            // Twilio serves media by appending the desired extension
            const mediaUrl = `${recordingUrl}.mp3`;
            // const mediaUrl = `${customerPhone}_${new Date().getTime()}.mp3`;

            // Create organized directory structure
            const baseDir = join(process.cwd(), 'recordings');
            const restaurantDir = restaurantNo ? join(baseDir, restaurantNo) : baseDir;
            await fs.mkdir(restaurantDir, { recursive: true });

            const fileName = `${customerPhone}${callSid ? `_${callSid}` : ''}.mp3`;
            filePath = join(restaurantDir, fileName);

            // Try to find customer and restaurant in database
            let customer: any = null;
            let restaurant: any = null;

            if (customerPhone && restaurantNo) {
                try {
                    // Find customer by phone and restaurant
                    customer = await prisma.customer.findFirst({
                        where: {
                            phone: customerPhone,
                            restaurant: {
                                phone: restaurantNo
                            }
                        }
                    });

                    // Find restaurant by phone
                    restaurant = await prisma.restaurant.findFirst({
                        where: {
                            phone: restaurantNo
                        }
                    });
                } catch (dbErr) {
                    console.error('Database lookup failed:', dbErr);
                }
            }

            // Download with Basic Auth using Account SID and Auth Token
            const username = process.env.TWILIO_SID as string;
            const password = process.env.TWILIO_AUTH as string;
            if (!username || !password) {
                return c.json({ success: false, message: 'Twilio credentials not configured' }, 500);
            }

            const resp = await axios.get(mediaUrl, {
                responseType: 'arraybuffer',
                auth: { username, password },
            });

            await fs.writeFile(filePath, Buffer.from(resp.data));

            // Optional upload to Bunny Storage with organized path
            let uploadedUrl: string | undefined;
            const bunnyHost = process.env.BUNNY_STORAGE_HOST; // e.g., ny.storage.bunnycdn.com
            const bunnyZone = process.env.BUNNY_STORAGE_ZONE; // e.g., restro-ai-call-agent
            const bunnyKey = process.env.BUNNY_STORAGE_ACCESS_KEY; // AccessKey
            
            const storagePath = restaurantNo ? `recordings/${restaurantNo}/${fileName}` : `recordings/${fileName}`;
            const storageUrl = `https://${bunnyHost}/${bunnyZone}/${storagePath}`;
            const cdnUrl = `https://restro-ai-call-agent.b-cdn.net/`

            if (bunnyHost && bunnyZone && bunnyKey) {
                try {
                    console.log(storageUrl,"sada");
                    
                    const fileBuffer = await fs.readFile(filePath);
                    await axios.put(storageUrl, fileBuffer, {
                        headers: {
                            'AccessKey': bunnyKey,
                            'Content-Type': 'audio/mpeg',
                        },
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity,
                    });
                    uploadedUrl = storageUrl;
                } catch (uploadErr) {
                    console.error('Bunny upload failed:', uploadErr instanceof Error ? uploadErr.message : String(uploadErr));
                }
            }

            
            // Save recording metadata to database if we have the data
            let savedRecording: any = null;
            if (restaurant && uploadedUrl) {
                try {
                    savedRecording = await prisma.callRecording.create({
                        data: {
                            customerId: customer?.id || null,
                            restaurantId: restaurant.id,
                            recordingUrl: cdnUrl+storagePath,
                            recordingDuration
                        }
                    });
                    
                    // Delete the local file after successfully saving to database
                    try {
                        await fs.unlink(filePath);
                        console.log(`Local recording file deleted: ${filePath}`);
                    } catch (deleteErr) {
                        console.error('Failed to delete local recording file:', deleteErr);
                        // Don't fail the entire operation if file deletion fails
                    }
                } catch (dbErr) {
                    console.error('Failed to save recording metadata:', dbErr);
                }
            }

            // Clean up local file if database save failed but file exists
            if (!savedRecording && restaurant && uploadedUrl) {
                try {
                    await fs.unlink(filePath);
                    console.log(`Local recording file cleaned up after failed database save: ${filePath}`);
                } catch (cleanupErr) {
                    console.error('Failed to cleanup local recording file:', cleanupErr);
                }
            }

            return c.json({
                success: true,
                filePath: savedRecording ? undefined : filePath, // Don't expose filePath if file was deleted
                mediaUrl,
                uploadedUrl,
                customer: customer ? { id: customer.id, name: customer.name, phone: customer.phone } : null,
                restaurant: restaurant ? { id: restaurant.id, name: restaurant.name, phone: restaurant.phone } : null,
                recordingId: savedRecording?.id || null,
            });
        } catch (err) {
            console.error("Error processing recording:", err)
            
            // Clean up local file if it was created but an error occurred
            if (typeof filePath !== 'undefined') {
                try {
                    await fs.unlink(filePath);
                    console.log(`Local recording file cleaned up after error: ${filePath}`);
                } catch (cleanupErr) {
                    console.error('Failed to cleanup local recording file after error:', cleanupErr);
                }
            }

            return c.json(
                {
                    error: 'Failed to process recording',
                    detail: err instanceof Error ? err.message : String(err),
                },
                500
            )
        }
    }
}
