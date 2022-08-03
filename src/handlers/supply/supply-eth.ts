import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import { kovanABI } from "../../abi/kovanAbi";

const providerUrl = process.env.PROVIDER_URL;
// const privateKey = process.env.PRIVATE_KEY;
const Web3 = require("web3");
const web3 = new Web3(providerUrl);

// Your Ethereum wallet private key
const privateKey = process.env.PRIVATE_KEY;

// Add your Ethereum wallet to the Web3 object
web3.eth.accounts.wallet.add("0x" + privateKey);

// Main Net Contract for cETH (the supply process is different for cERC20 tokens)
const contractAddress = "0x41b5844f4680a8c38fbb695b7f9cfd1f64474a72";
const cEthContract = new web3.eth.Contract(kovanABI, contractAddress);

// Ethereum has 18 decimal places
const ethDecimals = 18; 

export const SupplyEther = async (req: Request, res: Response) => {
  try {
    const { myWalletAddress, amountToSupply } = req.body;
    let ethBalance =
      (await web3.eth.getBalance(myWalletAddress)) / Math.pow(10, ethDecimals);

    // Mint some cETH by supplying ETH to the Compound Protocol
    await cEthContract.methods.mint().send({
      from: myWalletAddress,
      gasLimit: web3.utils.toHex(250000),
      gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
      value: web3.utils.toHex(web3.utils.toWei(amountToSupply, "ether")),
    });

    const balanceOfUnderlying =
      (await await web3.utils.toBN(
        await cEthContract.methods.balanceOfUnderlying(myWalletAddress).call()
      )) / Math.pow(10, ethDecimals);

    let cTokenBalance =
      (await cEthContract.methods.balanceOf(myWalletAddress).call()) / 1e8;

    let exchangeRateCurrent =
      (await cEthContract.methods.exchangeRateCurrent().call()) /
      Math.pow(10, 18 + ethDecimals - 8);

    cTokenBalance =
      (await cEthContract.methods.balanceOf(myWalletAddress).call()) / 1e8;

    ethBalance =
      (await web3.eth.getBalance(myWalletAddress)) / Math.pow(10, ethDecimals);

    return res.status(200).send({
      status: "success",
      message: "eth supplied successfully",
      ethBalance: ethBalance,
      cTokenBalance: cTokenBalance,
      balanceOfUnderlying: balanceOfUnderlying,
      exchangeRateCurrent: exchangeRateCurrent,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
};
