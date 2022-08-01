import { compound } from "../config/compound";
import { Request, Response } from "express";
import { PRIVATE_KEY, C_ETH_ADDRESS, C_TOKEN_ADDRESS, ASSET_NAME, PRICE_FEED_ADDRESS, UNDERLYING_ADDRESS, UNDERLYING_DECIMALS } from "../constants";

import dotenv from "dotenv";
dotenv.config();
import Web3 from "web3";
const web3 = new Web3(process.env.HOST as string);
