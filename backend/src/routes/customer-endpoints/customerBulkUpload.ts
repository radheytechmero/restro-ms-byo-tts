import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import * as XLSX from "xlsx";
import { createCustomerSchema } from "../../types";

export class CustomerBulkUpload extends OpenAPIRoute {
    schema = {
        tags: ["Customer"],
        summary: "Bulk upload customers from Excel file",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "multipart/form-data": {
                        schema: z.object({
                            file: z
                                .any()
                                .openapi({
                                    type: "string",
                                    format: "binary",
                                    description: "Excel file (.xlsx, .xls) containing customer data",
                                }),
                        }),
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Returns the upload results",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            message: z.string(),
                            totalProcessed: z.number(),
                            successful: z.number(),
                            failed: z.number(),
                            errors: z.array(z.object({
                                row: z.number(),
                                error: z.string(),
                                data: z.record(z.any())
                            })).optional(),
                        }),
                    },
                },
            },
            "400": {
                description: "Bad request - invalid file or data",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            error: z.string(),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        try {
            const body = await c.req.parseBody();
            const file = body['file'] as File;

            if (!file) {
                return c.json({ success: false, error: "Please upload a file" }, 400);
            }

            // Check file type
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                'application/vnd.ms-excel', // .xls
                'application/octet-stream' // fallback for some Excel files
            ];

            if (!allowedTypes.includes(file.type) && !file.name?.match(/\.(xlsx|xls)$/i)) {
                return c.json({ 
                    success: false, 
                    error: "Please upload a valid Excel file (.xlsx or .xls)" 
                }, 400);
            }

            // Convert File to Buffer
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Parse Excel file
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName:any = workbook.SheetNames[0];
            const worksheet:any = workbook.Sheets[sheetName];
            
            // Convert to JSON
            const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (rawData.length < 2) {
                return c.json({ 
                    success: false, 
                    error: "Excel file must contain at least a header row and one data row" 
                }, 400);
            }

            // Extract headers and data
            const headers = rawData[0] as string[];
            const dataRows = rawData.slice(1);

            // Validate required columns
            const requiredColumns = ['name', 'phone'];
            const missingColumns = requiredColumns.filter(col => 
                !headers.some(header => 
                    header?.toString().toLowerCase().trim() === col
                )
            );

            if (missingColumns.length > 0) {
                return c.json({ 
                    success: false, 
                    error: `Missing required columns: ${missingColumns.join(', ')}. Required columns are: ${requiredColumns.join(', ')}` 
                }, 400);
            }

            // Process data rows
            const prisma = c.get('prisma');
            const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number;
            
            let successful = 0;
            let failed = 0;
            const errors: Array<{ row: number; error: string; data: any }> = [];

            for (let i = 0; i < dataRows.length; i++) {
                const row:any = dataRows[i];
                const rowNumber = i + 2; // +2 because Excel rows start at 1 and we have header

                try {
                    // Create customer data object
                    const customerData: any = {};
                    
                    headers.forEach((header, index) => {
                        if (header && row[index] !== undefined && row[index] !== null && row[index] !== '') {
                            const key = header.toString().toLowerCase().trim();
                            customerData[key] = row[index];
                        }
                    });

                    // Validate required fields
                    if (!customerData.name || !customerData.phone) {
                        errors.push({
                            row: rowNumber,
                            error: "Missing required fields: name and phone are required",
                            data: customerData
                        });
                        failed++;
                        continue;
                    }

                    // Validate email format if provided
                    if (customerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
                        errors.push({
                            row: rowNumber,
                            error: "Invalid email format",
                            data: customerData
                        });
                        failed++;
                        continue;
                    }

                    // Create customer
                    await prisma.customer.create({
                        data: {
                            name: customerData.name,
                            email: customerData.email || null,
                            phone: customerData.phone,
                            restaurantId: authenticatedRestaurantId,
                        }
                    });

                    successful++;
                } catch (error: any) {
                    let errorMessage = "Failed to create customer";
                    
                    if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
                        errorMessage = "Customer with this email already exists";
                    } else if (error?.code === 'P2002' && error?.meta?.target?.includes('phone')) {
                        errorMessage = "Customer with this phone already exists";
                    }

                    errors.push({
                        row: rowNumber,
                        error: errorMessage,
                        data: row
                    });
                    failed++;
                }
            }

            const totalProcessed = successful + failed;
            const message = `Processed ${totalProcessed} customers. ${successful} successful, ${failed} failed.`;

            return c.json({
                success: true,
                message,
                totalProcessed,
                successful,
                failed,
                errors: errors.length > 0 ? errors : undefined,
            });

        } catch (error) {
            console.error("Excel upload error:", error);
            return c.json({ 
                success: false, 
                error: "Failed to process Excel file" 
            }, 500);
        }
    }
}
