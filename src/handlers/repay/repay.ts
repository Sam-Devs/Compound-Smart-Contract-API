import dotenv from "dotenv";
dotenv.config();
const Compound = require("@compound-finance/compound-js");
const compound = new (Compound as any)(process.env.PROVIDER_URL, {
  privateKey: process.env.PRIVATE_KEY,
});
import { Request, Response } from "express";

export const RepayBorrow = async (req: Request, res: Response) => {
  try {
    const { assetName, underlyingToRepay }: any = req.body;
    const cTokenAddress = Compound.util.getAddress(Compound.cDAI);
    let tx = await compound.repayBorrow(assetName, underlyingToRepay);
    const repayBorrowResult = await tx.wait(1);

    if (repayBorrowResult.events && repayBorrowResult.events.Failure) {
      const errorCode = repayBorrowResult.events.Failure.returnValues.error;
      console.error(`repayBorrow error, code ${errorCode}`);
      process.exit(1);
    }

    // let balance = await _borrowBalanceCurrent(
    //   "0x41b5844f4680a8c38fbb695b7f9cfd1f64474a72",
    //   myWalletAddress,
    //   underlyingDecimals
    // );

    return res.status(200).send({
      status: 200,
      message: "Borrow Repayed successfully",
      txn: repayBorrowResult,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send({ error });
  }
};
