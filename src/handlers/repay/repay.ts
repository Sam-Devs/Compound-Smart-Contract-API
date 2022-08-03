import dotenv from "dotenv";
dotenv.config();
const Compound = require("@compound-finance/compound-js");
const compound = new (Compound as any)(process.env.PROVIDER_URL, {
  privateKey: process.env.PRIVATE_KEY,
});
import { Request, Response } from "express";

export const Repay = async (req: Request, res: Response) => {
  try {
    const { assetName, assetToRepay }: any = req.body;
    // const cTokenAddress = Compound.utils.getAddress(Compound.cDai);
    let tx = await compound.repayBorrow(assetName, assetToRepay);
    const repayResult = await tx.wait(1);

    if (repayResult.events && repayResult.events.Failure) {
      const errorCode = repayResult.events.Failures.returnValues.error;
      console.error(`repay error ${errorCode}`);
      process.exit(1);
    }

    return res.status(200).send({
      status: 200,
      message: "Repaid Borrowed Asset Successfully",
      tx: repayResult,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
};
