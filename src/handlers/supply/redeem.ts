import { Response, Request } from "express";

import dotenv from "dotenv";
dotenv.config();

// import { abiJson } from "../../abi/ethAbi";
import { kovanABI } from "../../abi/kovanAbi";

const Web3 = require("web3");
const web3 = new Web3(process.env.PROVIDER_URL);

// Your Ethereum wallet private key
const privateKey = process.env.PRIVATE_KEY;

// Add your Ethereum wallet to the Web3 object
web3.eth.accounts.wallet.add("0x" + privateKey);

// Main Net Contract for cETH (the supply process is different for cERC20 tokens)
const contractAddress = "a";
const cEthContract = new web3.eth.Contract(kovanABI, contractAddress);

const ethDecimals = 18; // Ethereum has 18 decimal places

export const redeemToken = async (req: Request, res: Response) => {
  try {
    const { amountToRedeem, myWalletAddress } = req.body;
    let exchangeRateCurrent =
      (await cEthContract.methods.exchangeRateCurrent().call()) /
      Math.pow(10, 18 + ethDecimals - 8);

    let cTokenBalance =
      (await cEthContract.methods.balanceOf(myWalletAddress).call()) / 1e8;

    const balanceOfUnderlying =
      (await await web3.utils.toBN(
        await cEthContract.methods.balanceOfUnderlying(myWalletAddress).call()
      )) / Math.pow(10, ethDecimals);

    // Redeeming

    //Replace balance of underlying with cTokenBalance
    await cEthContract.methods.redeem(cTokenBalance * 1e8).send({
      from: myWalletAddress,
      gasLimit: web3.utils.toHex(500000),
      gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
    });

    const ethBalance =
      (await web3.eth.getBalance(myWalletAddress)) / Math.pow(10, ethDecimals);
    return res.status(200).send({
      status: "success",
      message: "Redeem Successfully",
      currentExchangeRate: exchangeRateCurrent,
      balanceOfUnderlying: balanceOfUnderlying,
      ethBalance: ethBalance,
    });
  } catch (error) {
    return res.status(500).send({ status: "error", message: error });
  }
};
