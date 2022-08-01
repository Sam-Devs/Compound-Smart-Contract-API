import dotenv from "dotenv";
dotenv.config();

export const options = {
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
    }
}