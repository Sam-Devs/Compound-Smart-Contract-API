import dotenv from "dotenv";
dotenv.config();
const Compound = require("@compound-finance/compound-js");
export const compound = new (Compound as any)(process.env.PROVIDER_URL, {
    privateKey: process.env.PRIVATE_KEY
});
