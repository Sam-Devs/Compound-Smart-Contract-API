const Compound = require("@compound-finance/compound-js");
import { Request, Response } from "express";
import { compound } from "../../config/compound";
import {
  _balanceOf,
  _balanceOfUnderlying,
  _exchangeRateCurrent,
} from "../../utils";
const Web3 = require("web3");
const providerUrl = process.env.PROVIDER_URL;
const web3 = new Web3(providerUrl);

export const SupplyErc20 = async (req: Request, res: Response) => {
  try {
    const {
      assetName,
      myWalletAddress,
      cTokenName,
      underlyingTokensToSupply,
    }: any = req.body;

    // See how many underlying ERC-20 tokens are in my wallet before we supply
    const tokenBalance = await _balanceOf(assetName, myWalletAddress);
    console.log(`My wallet's ${assetName} Token Balance:`, tokenBalance);

    // Number of decimals defined in this ERC20 token's contract
    const underlyingDecimals = Compound.decimals[assetName];

    console.log(
      `Approving and then supplying ${assetName} to the Compound Protocol...`,
      "\n"
    );

    // Mint cTokens by supplying underlying tokens to the Compound Protocol
    let txn = await compound.supply(
      assetName,
      underlyingTokensToSupply.toString()
    );
    await txn.wait(1); // wait until the transaction has 1 confirmation on the blockchain

    console.log(`c${assetName} "Mint" operation successful.`, "\n");

    const bal = await _balanceOfUnderlying(cTokenName, myWalletAddress);
    const balanceOfUnderlying = +bal / Math.pow(10, underlyingDecimals);

    console.log(
      `${assetName} supplied to the Compound Protocol:`,
      balanceOfUnderlying,
      "\n"
    );

    let cTokenBalance = await _balanceOf(cTokenName, myWalletAddress);
    console.log(`My wallet's c${assetName} Token Balance:`, cTokenBalance);

    let underlyingBalance = await _balanceOf(assetName, myWalletAddress);

    // let erCurrent = await _exchangeRateCurrent(cTokenName);
    // let exchangeRate = +erCurrent / Math.pow(10, 18 + underlyingDecimals - 8);

    cTokenBalance = await _balanceOf(cTokenName, myWalletAddress);
    underlyingBalance = await _balanceOf(assetName, myWalletAddress);

    return res.status(200).send({
      underlyingBalance: underlyingBalance,
      cTokenBalance: cTokenBalance,
      // exchangeRate: exchangeRate,
    });
  } catch (error) {
    return res.send({ error });
  }
};
