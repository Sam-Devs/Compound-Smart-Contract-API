import dotenv from "dotenv";
dotenv.config();
const Compound = require("@compound-finance/compound-js");
const Web3 = require("web3");
const providerUrl = process.env.PROVIDER_URL;
const web3 = new Web3(providerUrl);
const compound = new (Compound as any)(process.env.PROVIDER_URL, {
  privateKey: process.env.PRIVATE_KEY,
});
import { Request, Response } from "express";
import { enterMarket, _balanceOf } from "../../utils";

// Mainnet Contract for the Compound Protocol's Comptroller
// const comptrollerAddress = Compound.util.getAddress(Compound.cETH);

export const BorrowErc20WithEth = async (req: Request, res: Response) => {
  try {
    const {
      ethToSupplyAsCollateral,
      underlyingToBorrow,
      assetName,
      myWalletAddress,
    } = req.body;

    const underlyingDecimals = (Compound.decimals as any)[assetName]; // Number of decimals defined in this ERC20 token's contract

    // CONTRACT ADDRESS OF THE NAMED CONTRACT
    const underlyingAddress = Compound.util.getAddress(assetName);
    const cTokenAddress = Compound.util.getAddress("c" + assetName);
    // const cToken = new web3.eth.Contract(cErcAbi, cTokenAddress);

    await compound.supply(Compound.ETH, ethToSupplyAsCollateral);
    await enterMarket();

    console.log(
      `Now attempting to borrow ${underlyingToBorrow} ${assetName}...`
    );

    let tx = await compound.borrow(assetName, underlyingToBorrow);
    await tx.wait(1);
    console.log(`Borrowed ${underlyingToBorrow} ${assetName}...`);
    
    const cEthAddress = Compound.util.getAddress(Compound.cETH);
    const assetAddress = Compound.util.getAddress(Compound[assetName]);

    const balance = await _balanceOf(assetName, myWalletAddress);
    const ethBalance = await _balanceOf(assetName, myWalletAddress);


    return res.status(200).send({
      status: 200,
      message: "Asset Borrowed successfully",
      borrowBalance: balance,
      etherBalance: ethBalance
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send(error);
  }
};
