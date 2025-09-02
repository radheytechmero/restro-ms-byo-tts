import axios from 'axios';

export const createCloverOrder = async (mid, token, orderItem, customerUID) => {

    
    const lineItems = orderItem.map((item: any) => ({
        item: {
            id: item.menuUID,
        },
    }));

    let note = orderItem.map((d:any) => d.notes).join();
    
    // Prepare order payload for Clover API
    const cloverOrderPayload = {
        orderCart: {
            groupLineItems: false,
            lineItems: lineItems,
            note
        }
    };

    const orderResponse = await axios.post(
        `${process.env.CLOVER_BASE_URL}/merchants/${mid}/atomic_order/orders`,
        cloverOrderPayload,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );

    if (!orderResponse.data || orderResponse.status !== 200) {
        throw new Error('Unexpected response from Clover API');
    }

    console.log(orderResponse.data, "asd");

    const customerUpdate = {
        customers: [
            {
                id: customerUID
            }
        ]
    };

    const orderUpdateResponse = await axios.post(
        `${process.env.CLOVER_BASE_URL}/merchants/${mid}/orders/${orderResponse.data.id}`,
        customerUpdate,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );
    // let responseContent = {
    //     success: true,
    //     message: `Order placed successfully!`,
    // };

    // Verify customer was successfully associated with order
    if (orderUpdateResponse.status !== 200) {
        console.warn('Warning: Customer may not have been properly associated with order');
    }

}


export const createCloverCustomer = async (mid, token, customerName, customerPhone) => {

    const customer = {
        firstName: customerName,
        phoneNumbers: [
            {
                phoneNumber: customerPhone
            }
        ]
    };

    const addCustomerResponse = await axios.post(
        `${process.env.CLOVER_BASE_URL}/merchants/${mid}/customers`,
        customer,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );

    return addCustomerResponse.data
}