const Web3 = require("web3");
const Compound = require("@compound-finance/compound-js");
import { assert } from "console";
import { Request, Response } from "express";
import { compound } from "../../config/compound";
import {
  _balanceOf,
  _balanceOfUnderlying,
  _exchangeRateCurrent,
} from "../../utils";
const providerUrl = process.env.PROVIDER_URL;
const web3 = new Web3(providerUrl);

export const SupplyERC20 = async (req: Request, res: Response) => {
  try {
    const { assetName, walletAddress, cTokenName, assetToSupply }: any =
      req.body;

    const tokenBalance = await _balanceOf(assetName, walletAddress);
    console.log(`My wallet's ${assetName} token balance:`, tokenBalance);

    const underlyingDecimal = Compound.decimals[assetName];
    console.log(
      `Approving and then Supplying ${assetName} to the Compound Protocol`,
      "\n"
    );

    let tnx = await compound.supply(assetName, assetToSupply.toString());
    await tnx.wait(1);

    console.log(`c${assetName} "Mint" operation successfully`, "\n");

    const balance = await _balanceOfUnderlying(cTokenName, walletAddress);
    const balanceOfUnderlying = +balance / Math.pow(10, assetToSupply);

    console.log(`${assetName} supplied to the Compound Protocol:`, "\n");

    let cTokenBalance = await _balanceOf(cTokenName, walletAddress);
    console.log(`c${assetName} token balance:`, cTokenBalance);

    let underlyingBalance = await _balanceOf(assetName, walletAddress);

    cTokenBalance = await _balanceOf(cTokenName, walletAddress);
    underlyingBalance = await _balanceOf(assetName, walletAddress);

    return res.status(200).send({
      underlyingBalance: underlyingBalance,
      cTokenBalance: cTokenBalance,
    });
  } catch (error) {
    return res.send({ error });
  }
};
