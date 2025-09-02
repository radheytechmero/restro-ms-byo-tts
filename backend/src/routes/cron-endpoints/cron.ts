
import axios from "axios";

export const customerCron = async (
  prisma,
  restaurantId,
  merchantId: string,
  token: string
) => {
  try {
    // Get most recent customer in DB
    const lastCustomer = await prisma.customer.findFirst({
      orderBy: { createdAt: "desc" },
    });

    // Use Clover's `customerSince` filter if we already have customers
    const filterParam = lastCustomer
      ? `?filter=customerSince>${new Date(lastCustomer.createdAt).getTime()}&expand=emailAddresses,phoneNumbers`
      : `?expand=emailAddresses,phoneNumbers`;

    const url = `https://sandbox.dev.clover.com/v3/merchants/${merchantId}/customers${filterParam}`;

    // Fetch customers from Clover
    const { data } = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const elements = data?.elements || [];
    if (elements.length === 0) {
      console.log("No new customers found.");
      return;
    }

    // Map Clover → DB schema
    const payload = elements
      .map((cust: any) => ({
        name: `${cust.firstName || ""} ${cust.lastName || ""}`.trim(),
        phone: cust.phoneNumbers?.elements?.[0]?.phoneNumber || null,
        email: cust.emailAddresses?.elements?.[0]?.emailAddress || null,
        restaurantId,
      }))
      // filter out customers without phone numbers
      .filter((c: any) => !!c.phone);

    if (payload.length === 0) {
      console.log("Fetched customers, but none had valid phone numbers.");
      return;
    }

    // Bulk insert customers
    await prisma.customer.createMany({
      data: payload,
      skipDuplicates: true, // avoids inserting same customer twice
    });

    console.log(`${payload.length} new customers added (duplicates ignored).`);
  } catch (error) {
    console.error("Customer sync failed:", error);
  }
};


export const menuCron = async (prisma, restaurantId , merchantId: string, token: string) => {
  try {
    // Get latest menu item stored in DB
    const lastMenu = await prisma.menuItem.findFirst({
      orderBy: { createdAt: "desc" },
    });

    // Build Clover API URL
    const filterParam = lastMenu
      ? `?filter=modifiedTime>${new Date(lastMenu.createdAt).getTime()}`
      : "";
    const url = `https://sandbox.dev.clover.com/v3/merchants/${merchantId}/items${filterParam}`;

    // Fetch menu items
    const { data } = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const elements = data?.elements || [];
    if (elements.length === 0) {
      console.log("No new menu items found.");
      return;
    }

    // Map Clover items → DB schema
    const payload = elements.filter((data: any) => data.available)
    .map((item: any) => ({
      menuUID: item.id,
      name: item.name,
      price: item.price,
      restaurantId,
    }));

    // Bulk insert (skip duplicates if supported by DB)
    await prisma.menuItem.createMany({
      data: payload
    });

    console.log(`${payload.length} new/updated menu items processed.`);
  } catch (error) {
    console.error("Menu sync failed:", error);
  }
};