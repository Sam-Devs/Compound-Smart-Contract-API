import dotenv from "dotenv";
dotenv.config();
const Compound = require("@compound-finance/compound-js");
const Web3 = require("web3");
import { Request, Response } from "express";
const compound = new (Compound as any)(process.env.PROVIDER_URL, {
  privateKey: process.env.PRIVATE_KEY,
});
import { _borrowBalanceCurrent } from "../../utils";

export const BorrowWithERC20 = async (req: Request, res: Response) => {
  try {
    const { assetName, assetToBorrow, assetAsCollateral, walletAddress } =
      req.body;

    const underlyingDecimal = Compound.decimals[assetName]; // Number of decimals defined in this ERC20 token's contract
    console.log(
      `Supplying ${assetName} to the protocol as collateral, you will get c${assetName} in return`
    );
    let txs = await compound.supply(assetName, assetAsCollateral);
    const mintResult = await txs.wait(1); // wait until the transaction has 1 confirmation on the blockchain

    let failure = mintResult.events.find((i: any) => i.event === "Failure");
    if (failure) {
      const errorCode = failure.args.error;
      throw new Error(
        `See https://compound.finance/docs/ctokens#ctoken-error-codes\n` +
          `Code: ${errorCode}\n`
      );
    }

    console.log(
      "\nEntering market (via Comptroller contract) for ETH (as collateral)"
    );
    let markets = [assetName];
    let tx = await compound.enterMarket(markets);
    await tx.wait(1);

    console.log(`\n Now attempting to borrow ${assetToBorrow} ETH`);
    let txmB = await compound.borrow(Compound.ETH, assetToBorrow);
    const borrowResult = await txmB.wait(1);

    if (isNaN(borrowResult)) {
      console.log(`\nETH Borrow Successfully.`);
    } else {
      throw new Error(
        `See https://compound.finance/docs/ctokens#ctoken-error-codes\n` +
          `Code: ${borrowResult}\n`
      );
    }

    let balance = await _borrowBalanceCurrent("0x41b5844f4680a8c38fbb695b7f9cfd1f64474a72", walletAddress, underlyingDecimal);
    return res.status(200).send({
        status: "success",
        message: "ether borrowed successfully",
        ethBorrowBalance: balance
    })
  } catch (error) {
    return res.status(500).send({ error });
  }
};
