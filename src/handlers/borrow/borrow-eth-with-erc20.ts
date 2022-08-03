import dotenv from "dotenv";
dotenv.config();
const Compound = require("@compound-finance/compound-js");
const privateKey = process.env.PRIVATE_KEY;
const providerUrl = process.env.PROVIDER_URL;
const compound = new (Compound as any)(providerUrl, {
  privateKey: privateKey,
});
import { _borrowBalanceCurrent } from "../../utils";
import { Request, Response } from "express";

export const BorrowEthWithErc20 = async (req: Request, res: Response) => {
  try {
    const {
      underlyingAsCollateral,
      ethToBorrow,
      assetName,
      walletAddress,
    }: any = req.body;

    const underlyingDecimals = Compound.decimals[assetName]; // Number of decimals defined in this ERC20 token's contract

    console.log(
      `Supplying ${assetName} to the protocol as collateral (you will get c${assetName} in return)\n`
    );
    let txS = await compound.supply(assetName, underlyingAsCollateral);
    // Wait until the transaction has 1 confirmation on the blockchain
    const mintResult = await txS.wait(1); 

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
    // Collateral asset
    let markets = [assetName]; 
    let tx = await compound.enterMarkets(markets);
    await tx.wait(1);

    console.log(`\nNow attempting to borrow ${ethToBorrow} ETH`);
    let txmB = await compound.borrow(Compound.ETH, ethToBorrow);
    const borrowResult = await txmB.wait(1);

    if (isNaN(borrowResult)) {
      console.log(`\nETH borrow successful.\n`);
    } else {
      throw new Error(
        `See https://compound.finance/docs/ctokens#ctoken-error-codes\n` +
          `Code: ${borrowResult}\n`
      );
    }

    // await logBalances(assetName, walletAddress);

    // const cEthAddress = Compound.util.getAddress(Compound.cETH);
    let balance = await _borrowBalanceCurrent(
      "0x41b5844f4680a8c38fbb695b7f9cfd1f64474a72",
      walletAddress,
      underlyingDecimals
    );

    return res.status(200).send({
      status: "success",
      message: "ether borrowed successfully",
      ethBorrowBalance: balance,
    });
  } catch (err: any) {
    return res.status(500).send({ err });
  }
};
