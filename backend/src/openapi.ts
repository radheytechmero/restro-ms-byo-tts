import { fromHono } from "chanfana";
import { Hono } from "hono";
import { RestaurantList } from "./routes/restaurant-endpoints/restaurantList";
import { RestaurantCreate } from "./routes/restaurant-endpoints/restaurantCreate";
import { globalConfig } from "./config/globalConfig";
import { RestaurantUpdate } from "./routes/restaurant-endpoints/restaurantUpdate";
import { RestaurantFetch } from "./routes/restaurant-endpoints/restaurantFetch";
import { RestaurantDelete } from "./routes/restaurant-endpoints/restaurantDelete";
import { LoginRoute } from "./routes/auth-endpoints/login";
import { authMiddleware } from "./middleware/auth";
import { restaurantScopeMiddleware } from "./middleware/restaurant-scope";
import { MenuItemList } from "./routes/menu-items-endpoints/menuList";
import { MenuItemCreate } from "./routes/menu-items-endpoints/menuCreate";
import { MenuItemUpdate } from "./routes/menu-items-endpoints/menuUpdate";
import { MenuItemDelete } from "./routes/menu-items-endpoints/menuDelete";
import { OrderList } from "./routes/order-endpoints/orderList";
import { OrderCreate } from "./routes/order-endpoints/orderCreate";
import { OrderFetch } from "./routes/order-endpoints/orderFetch";
import { OrderUpdate } from "./routes/order-endpoints/orderUpdate";
import { OrderDelete } from "./routes/order-endpoints/orderDelete";
import { OrderItemFetch } from "./routes/order-item-endpoints/orderItemFetch";
import { CategoryList } from "./routes/category-endpoints/categoryList";
import { CategoryCreate } from "./routes/category-endpoints/categoryCreate";
import { CategoryUpdate } from "./routes/category-endpoints/categoryUpdate";
import { CategoryDelete } from "./routes/category-endpoints/categoryDelete";
import { CustomerList } from "./routes/customer-endpoints/customerList";
import { CustomerCreate } from "./routes/customer-endpoints/customerCreate";
import { CustomerFetch } from "./routes/customer-endpoints/customerFetch";
import { CustomerUpdate } from "./routes/customer-endpoints/customerUpdate";
import { CustomerDelete } from "./routes/customer-endpoints/customerDelete";
import { CustomerSearch } from "./routes/customer-endpoints/customerSearch";
import { CustomerBulkUpload } from "./routes/customer-endpoints/customerBulkUpload";
import { CustomerTemplateDownload } from "./routes/customer-endpoints/customerTemplateDownload";
import { DashboardData } from "./routes/dashboard-endpoints/dashboardData";
import { TwilioWebhookRoute } from "./routes/twilio-endpoints/twilioWebhook";
import { TableList } from "./routes/table-endpoints/tableList";
import { TableCreate } from "./routes/table-endpoints/tableCreate";
import { TableUpdate } from "./routes/table-endpoints/tableUpdate";
import { TableDelete } from "./routes/table-endpoints/tableDelete";
import { CronUpdate } from "./routes/cron-endpoints/cronUpdate";
import { TwilioCallRecording } from "./routes/twilio-endpoints/twillioCallRecording";
import { RecordingList } from "./routes/recording-endpoints/recordingList";
import { RecordingFetch } from "./routes/recording-endpoints/recordingFetch";
import { RecordingCreate } from "./routes/recording-endpoints/recordingCreate";
import { RestaurantFetchByPhone } from "./routes/restaurant-endpoints/restaurantFetchByPhone";


export function setUpOpenAPI(app) {
    // Setup OpenAPI registry
    const openapi = fromHono(app, {
        docs_url: "/docs",
        // base: globalConfig.baseURL,
        // redoc_url: "/docs",
        schema: {
            info: {
                title: "Restaurant Management API",
                version: "1.0.0",
                description: "API for restaurant management system",
            },
            // security: [
            //     {
            //         bearerAuth: [],

            //     },
            // ],
        }
    });
    openapi.registry.registerComponent('securitySchemes', 'bearerAuth', {
        type: 'http',
        scheme: 'bearer',
    })

    // Auth 
    openapi.post(`${globalConfig.baseURL}/login`, LoginRoute);

    // Twilio webhook (no auth required)
    openapi.post(`${globalConfig.baseURL}/twilio`, TwilioWebhookRoute);
    openapi.post(`${globalConfig.baseURL}/recording`, TwilioCallRecording);

    // Cron (no auth middleware; secured via header key)
    openapi.post(`${globalConfig.baseURL}/cron/update`, CronUpdate);

    // Menu Item OpenAPI endpoints
    openapi.get(`${globalConfig.baseURL}/menu-items`, MenuItemList);

    openapi.post(`${globalConfig.baseURL}/create-order`, OrderCreate);

    openapi.get(`${globalConfig.baseURL}/customers`, CustomerSearch);

    openapi.get(`${globalConfig.baseURL}/restaurant/:phone`, RestaurantFetchByPhone);



    openapi.use(`/api/*`, authMiddleware)
    openapi.use(`/api/*`, restaurantScopeMiddleware)
    openapi.post(`${globalConfig.baseURL}/menu-items`, MenuItemCreate);
    openapi.put(`${globalConfig.baseURL}/menu-items/:id`, MenuItemUpdate);
    openapi.delete(`${globalConfig.baseURL}/menu-items/:id`, MenuItemDelete);



    // Register OpenAPI endpoints
    openapi.get(`${globalConfig.baseURL}/restaurant`, RestaurantList);
    openapi.get(`${globalConfig.baseURL}/fetch-restaurant`, RestaurantFetch);
    openapi.post(`${globalConfig.baseURL}/create-restaurant`, RestaurantCreate);
    openapi.put(`${globalConfig.baseURL}/update-restaurant/:id`, RestaurantUpdate);
    openapi.delete(`${globalConfig.baseURL}/delete-restaurant/:id`, RestaurantDelete);

    // Order OpenAPI endpoints
    openapi.get(`${globalConfig.baseURL}/order`, OrderList);
    openapi.get(`${globalConfig.baseURL}/order/:id`, OrderFetch);
    openapi.put(`${globalConfig.baseURL}/order/:id`, OrderUpdate);
    openapi.delete(`${globalConfig.baseURL}/order/:id`, OrderDelete);

    // Order Item OpenAPI endpoints
    openapi.get(`${globalConfig.baseURL}/order-item/:name`, OrderItemFetch);

    // Category OpenAPI endpoints
    openapi.get(`${globalConfig.baseURL}/category`, CategoryList);
    openapi.post(`${globalConfig.baseURL}/category`, CategoryCreate);
    openapi.put(`${globalConfig.baseURL}/category/:id`, CategoryUpdate);
    openapi.delete(`${globalConfig.baseURL}/category/:id`, CategoryDelete);

    // Table OpenAPI endpoints
    openapi.get(`${globalConfig.baseURL}/table`, TableList);
    openapi.post(`${globalConfig.baseURL}/table`, TableCreate);
    openapi.put(`${globalConfig.baseURL}/table/:id`, TableUpdate);
    openapi.delete(`${globalConfig.baseURL}/table/:id`, TableDelete);

    // Customer OpenAPI endpoints
    openapi.get(`${globalConfig.baseURL}/customer/template`, CustomerTemplateDownload);
    openapi.get(`${globalConfig.baseURL}/customer`, CustomerList);
    openapi.post(`${globalConfig.baseURL}/customer`, CustomerCreate);
    openapi.get(`${globalConfig.baseURL}/customer/:id`, CustomerFetch);
    openapi.put(`${globalConfig.baseURL}/customer/:id`, CustomerUpdate);
    openapi.delete(`${globalConfig.baseURL}/customer/:id`, CustomerDelete);
    openapi.post(`${globalConfig.baseURL}/customer/bulk-upload`, CustomerBulkUpload);

    // Dashboard OpenAPI endpoints
    openapi.get(`${globalConfig.baseURL}/dashboard`, DashboardData);

    // Recording OpenAPI endpoints
    openapi.get(`${globalConfig.baseURL}/recordings`, RecordingList);
    openapi.get(`${globalConfig.baseURL}/recordings/:id`, RecordingFetch);
    openapi.post(`${globalConfig.baseURL}/recordings`, RecordingCreate);

    return openapi;
}

