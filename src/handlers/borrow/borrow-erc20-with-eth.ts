import dotenv from "dotenv";
dotenv.config();
import { Request, Response } from "express";
const Compound = require("@compound-finance/compound-js");
const providerUrl = process.env.PROVIDER_URL;
const Web3 = require("web3");
const web3 = new Web3(providerUrl);
const compound = new (Compound as any)(process.env.PROVIDER_URL, {
  privateKey: process.env.PRIVATE_KEY,
});
import { enterMarket, _balanceOf } from "../../utils";

export const BorrowErc20WithEth = async (req: Request, res: Response) => {
  try {
    const {
      ethToSupplyAsCollateral,
      underlyingToBorrow,
      assetName,
      walletAddress,
    } = req.body;

    await compound.supply(Compound.ETH, ethToSupplyAsCollateral);
    await enterMarket();

    console.log(
      `Now attempting to borrow ${underlyingToBorrow} ${assetName}`
    );

    let tx = await compound.borrow(assetName, underlyingToBorrow);
    await tx.wait(1);
    console.log(`Borrowed ${underlyingToBorrow} ${assetName}`);

    const balance = await _balanceOf(assetName, walletAddress);
    const ethBalance = await _balanceOf(assetName, walletAddress);

    return res.status(200).send({
      status: 200,
      message: "Asset Borrowed successfully",
      borrowBalance: balance,
      etherBalance: ethBalance,
    });
  } catch (error) {
    return res.status(500).send(error);
  }
};
