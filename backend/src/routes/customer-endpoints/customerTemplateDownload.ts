import { OpenAPIRoute } from "chanfana";
import { type AppContext } from "../../middleware/prisma-client";
import * as XLSX from "xlsx";
import { z } from "zod";

export class CustomerTemplateDownload extends OpenAPIRoute {
  schema = {
    tags: ["Customer"],
    summary: "Download Excel template for customer bulk upload",
    security: [{ bearerAuth: [] }],
    responses: {
      "200": {
        description: "Returns Excel template file",
        content: {
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
            schema: z.any().openapi({
              type: "string",
              format: "binary",
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    try {
      // Create sample data
      const sampleData = [
        ["name", "email", "phone"],
        ["John Doe", "john.doe@example.com", "+1234567890"],
        ["Jane Smith", "jane.smith@example.com", "+1234567891"],
        ["Bob Johnson", "bob.johnson@example.com", "+1234567892"],
      ];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(sampleData);

      // Set column widths
      worksheet["!cols"] = [
        { wch: 20 }, // name
        { wch: 30 }, // email
        { wch: 15 }, // phone
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

      // Generate buffer as Uint8Array
      const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
      const uint8Array = new Uint8Array(buffer);

      // Return binary response
      return c.body(uint8Array, 200, {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="customer_template.xlsx"',
      });
    } catch (error) {
      console.error("Template download error:", error);
      return c.json(
        {
          success: false,
          error: "Failed to generate template",
        },
        500
      );
    }
  }
}
