import dotenv from "dotenv";
dotenv.config();
const Compound = require("@compound-finance/compound-js");
const Web3 = require("web3");
const providerUrl = process.env.PROVIDER_URL;
const web3 = new Web3(providerUrl);
const compound = new (Compound as any)(process.env.PROVIDER_URL, {
    privateKey: process.env.PRIVATE_KEY
})
import { Request, Response} from "express";
import { enterMarket, _balanceOf} from "../../utils";

export const ERC20WithEth = async (req: Request, res: Response) => {
    try {
        const { ethToSupplyAsCollateral, assetName, assetToBorrow, walletAddress} = req.body;
        await compound.supply(Compound.ETH, ethToSupplyAsCollateral);
        await enterMarket;

        console.log(`Borrowed ${assetToBorrow} ${assetName}`);

        const balance = await _balanceOf(assetName, walletAddress);
        const ethBalance = await _balanceOf(assetName, walletAddress);

        return res.status(200).send({
            status: 200,
            message: "Asset borrowed successfully",
            borrowBalance: balance,
            ethBalance: ethBalance
        })
        
    } catch (error) {
        return res.status(500).send(error);
    }
}