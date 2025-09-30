import axios from 'axios';

export const createCloverOrder = async (mid, token, orderItem, customerUID) => {


    try {
        // const lineItems = orderItem.map((item) => ({
        //     item: {
        //         id: item.menuUID
        //     },
        // }));

        const lineItems = orderItem.flatMap(item =>
            Array.from({ length: item.quantity }, () => ({
                item: { id: item.menuUID }
            }))
        );

        let note = orderItem.map((d) => d.notes).join();

        const cloverOrderPayload = {
            orderCart: {
                groupLineItems: false,
                lineItems: lineItems,
                note
            }
        };

        console.log(cloverOrderPayload, "Here");

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
            return {
                success: false,
                error: 'Unexpected response from Clover API',
                data: orderResponse.data
            };
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

        if (orderUpdateResponse.status !== 200) {
            return {
                success: false,
                error: 'Customer may not have been properly associated with order',
                data: orderUpdateResponse.data
            };
        }

        return {
            success: true,
            message: 'Order placed successfully!',
            order: orderResponse.data,
            customerUpdate: orderUpdateResponse.data
        };
    } catch (error) {
        console.error('Clover order error:', error);
        let errorMsg = 'Unknown error';
        if (typeof error === 'object' && error !== null) {
            if ('response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
                errorMsg = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
            } else if ('message' in error && typeof error.message === 'string') {
                errorMsg = error.message;
            } else {
                errorMsg = JSON.stringify(error);
            }
        } else if (typeof error === 'string') {
            errorMsg = error;
        }
        return {
            success: false,
            error: errorMsg
        };
    }
}


export const createCloverCustomer = async (mid, token, customerName, customerPhone) => {

    try {
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

        if (!addCustomerResponse.data || addCustomerResponse.status !== 200) {
            return {
                success: false,
                error: 'Unexpected response from Clover API',
                data: addCustomerResponse.data
            };
        }

        return {
            success: true,
            customer: addCustomerResponse.data
        };
    } catch (error) {
        console.error('Clover customer error:', error);
        let errorMsg = 'Unknown error';
        if (typeof error === 'object' && error !== null) {
            if ('response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
                errorMsg = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
            } else if ('message' in error && typeof error.message === 'string') {
                errorMsg = error.message;
            } else {
                errorMsg = JSON.stringify(error);
            }
        } else if (typeof error === 'string') {
            errorMsg = error;
        }
        return {
            success: false,
            error: errorMsg
        };
    }
}