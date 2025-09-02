import * as XLSX from 'xlsx';

export interface CustomerTemplateRow {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export const generateCustomerTemplate = (): Blob => {
  // Create sample data
  const sampleData: CustomerTemplateRow[] = [
    {
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john.doe@example.com',
      address: '123 Main St, City, State 12345'
    },
    {
      name: 'Jane Smith',
      phone: '+1987654321',
      email: 'jane.smith@example.com',
      address: '456 Oak Ave, Town, State 67890'
    }
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Add headers with descriptions
  const headers = [
    { name: 'name', description: 'Customer full name (required)' },
    { name: 'phone', description: 'Phone number (required)' },
    { name: 'email', description: 'Email address (optional)' },
    { name: 'address', description: 'Full address (optional)' }
  ];

  // Add header row with descriptions
  const headerRow = headers.map(h => h.name);
  const descriptionRow = headers.map(h => h.description);
  
  XLSX.utils.sheet_add_aoa(worksheet, [headerRow, descriptionRow], { origin: 'A1' });

  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Template');

  // Generate blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
};

export const validateCustomerData = (data: any[]): Array<{ row: number; error: string; data: any }> => {
  const errors: Array<{ row: number; error: string; data: any }> = [];

  data.forEach((row, index) => {
    const rowNumber = index + 1; // +1 because index is 0-based

    // Check required fields
    if (!row.name || typeof row.name !== 'string' || row.name.trim() === '') {
      errors.push({
        row: rowNumber,
        error: 'Name is required and must be a string',
        data: row
      });
    }

    if (!row.phone || typeof row.phone !== 'string' || row.phone.trim() === '') {
      errors.push({
        row: rowNumber,
        error: 'Phone is required and must be a string',
        data: row
      });
    }



    // Check email format if provided
    if (row.email && typeof row.email === 'string' && row.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        errors.push({
          row: rowNumber,
          error: 'Invalid email format',
          data: row
        });
      }
    }
  });

  return errors;
};

export const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first worksheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON, skipping header rows
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          range: 2 // Skip first two rows (headers and descriptions)
        });

        // Convert to objects
        const customers = jsonData.map((row: any) => ({
          name: row[0] || '',
          phone: row[1] || '',
          email: row[2] || '',
          address: row[3] || ''
        }));

        resolve(customers);
      } catch (error) {
        reject(new Error('Failed to parse Excel file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};
