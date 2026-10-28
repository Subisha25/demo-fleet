import dotenv from "dotenv";

// Loading env to process
dotenv.config();

const WEB_BASE_URL = process.env.WEB_BASE_URL || "http://localhost:3000";
const BASE_URL = process.env.API_BASE_URL || "http://localhost:5001";

const config = {
  server: {
    protocol: process.env.PROTOCOL || "http",
    host: process.env.API_HOST || "0.0.0.0",
    port: parseInt(process.env.API_PORT || "5555"),
  },
  baseurl:
  {
    webbaseurl: WEB_BASE_URL || "http://localhost:3000",
    apibaseurl: process.env.API_BASE_URL || "http://localhost:5000",
  },
  database: {
    host: process.env.DB_HOST || "",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    dbname: process.env.DB_NAME || "",
    dialect: process.env.DB_DIALECT || "",
  },
  logs: {
    level: process.env.LOG_LEVEL || "error",
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '', // Your Twilio phone number
  },

  twofactor: {
    apiKey: process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY || '',
    senderId: process.env.TWO_FACTOR_SENDER_ID || process.env.TWOFACTOR_SENDER_ID || 'GRCCAB',
    templateName: process.env.TWOFACTOR_TEMPLATE_NAME || 'OTP1',
  },
 
  security: {
    jwtSecret: process.env.JWT_SECRET || "",
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "3h",
  },
  app: {
    loginLink: process.env.LOGIN_LINK,
  },
  sendmail: {
    smtp_server: process.env.SMTP_SERVER || process.env.SMTP_HOST || "",
    smtp_email: process.env.SMTP_EMAIL_ADDRESS || process.env.SMTP_USER || "",
    smtp_password: process.env.SMTP_EMAIL_PASSWORD || process.env.SMTP_PASS || "",
    smtp_port: parseInt(process.env.SMTP_EMAIL_PORT || process.env.SMTP_PORT || "587"),
    smtp_secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1",
    superadmin_email: process.env.SUPERADMIN_EMAIL || "subisha2002.m@gmail.com",
  },
  companyurl: {
    seo_base: process.env.SEO_BASE_URL || `${WEB_BASE_URL}/Company/`
  },
  paymentgateway: {
    pg_merchant_id: process.env.PG_MERCHANT_ID || "",
    pg_api_key: process.env.PG_API_KEY || "",
    pg_api_password: process.env.PG_API_PASSWORD || "",

    pg_create_url: process.env.PG_CREATE_URL || "" ,
    pg_status_url: process.env.PG_STATUS_URL || "",
    pg_response_key: process.env.PG_RESPONSE_KEY || "",
    pg_signature_key: process.env.PG_RESPONSE_KEY || "",
    pg_webhook_url: process.env.PG_WEBHOOK_URL || "",

    pg_return_url: process.env.PG_RETURN_URL || "",
    pg_callback_url: process.env.PG_CALLBACK_URL|| "",
     pg_client_id: process.env.PG_CLIENT_ID || "",            // Payment Page Client ID
    pg_order_id_prefix: process.env.PG_ORDER_ID_PREFIX || "ORD",
    pg_amount_in_paise: (process.env.PG_AMOUNT_IN_PAISE || "false").toLowerCase() === "true",
  }

};

export default config;
