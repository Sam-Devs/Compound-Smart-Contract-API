import dotenv from "dotenv";
dotenv.config();

import { Response, Request } from "express";

import { kovanABI } from "../../abi/kovanAbi";

const Web3 = require("web3");
const web3 = new Web3(process.env.PROVIDER_URL);

// Your Ethereum wallet private key
const privateKey = process.env.PRIVATE_KEY;

// Add your Ethereum wallet to the Web3 object
web3.eth.accounts.wallet.add("0x" + privateKey);

// Main Net Contract for cETH (the supply process is different for cERC20 tokens)
const contractAddress = "0x41b5844f4680a8c38fbb695b7f9cfd1f64474a72";
const cEthContract = new web3.eth.Contract(kovanABI, contractAddress);

// Ethereum has 18 decimal places
const ethDecimals = 18; 

export const redeemToken = async (req: Request, res: Response) => {
  try {
    const { amountToRedeem, walletAddress } = req.body;
    let exchangeRateCurrent =
      (await cEthContract.methods.exchangeRateCurrent().call()) /
      Math.pow(10, 18 + ethDecimals - 8);

    let cTokenBalance =
      (await cEthContract.methods.balanceOf(walletAddress).call()) / 1e8;

    const balanceOfUnderlying =
      (await await web3.utils.toBN(
        await cEthContract.methods.balanceOfUnderlying(walletAddress).call()
      )) / Math.pow(10, ethDecimals);

    // Redeeming

    //Replace balance of underlying with cTokenBalance
    await cEthContract.methods.redeem(cTokenBalance * 1e8).send({
      from: walletAddress,
      gasLimit: web3.utils.toHex(500000),
      gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
    });

    const ethBalance =
      (await web3.eth.getBalance(walletAddress)) / Math.pow(10, ethDecimals);
    return res.status(200).send({
      status: "success",
      message: "Asset Redeemed Successfully",
      currentExchangeRate: exchangeRateCurrent,
      balanceOfUnderlying: balanceOfUnderlying,
      ethBalance: ethBalance,
    });
  } catch (error) {
    return res.status(500).send({ status: "error", message: error });
  }
};
