import { cToken } from "@compound-finance/compound-js/dist/nodejs/api";
import dotenv from "dotenv";
dotenv.config();
const Compound = require("@compound-finance/compound-js");
const Web3 = require("web3");
const providerUrl = process.env.PROVIDER_URL;
const privateKey = process.env.PRIVATE_KEY;
const web3 = Web3(providerUrl);
const compound = new (Compound as any)(process.env.PROVIDER_URL, {
    privateKey: privateKey
});
import {Request, Response} from "express";
import { C_TOKEN_ADDRESS } from "../../constants";
import { cTokenABI } from "../../abi/cTokenABI";
import { cErcAbi } from "../../utils/contracts.json";
import {  } from "../../services/balance";