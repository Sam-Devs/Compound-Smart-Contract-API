import dotenv from "dotenv";
dotenv.config();
const Compound = require("@compound-finance/compound-js");
import { Request, Response } from "express";
import { compound } from "../config/compound";
const providerUrl = process.env.PROVIDER_URL;

export async function _balanceOf(asset: string, account: string) {
  const assetAddress = Compound.utils.getAddress(Compound[asset]);
  let balance;

  try {
    balance = await Compound.eth.read(
      assetAddress,
      "function balanceOf() returns (uint)",
      [account],
      { provider: providerUrl }
    );
  } catch (error) {
    console.error(error);
  }

  return +balance.toNumber() / Math.pow(10, Compound.decimals[asset]);
}

export async function _getAccountLiquidity(
  account: string,
  _comptrollerAddress: string
) {
  let error, shortfall, liquidity;

  try {
    [error, liquidity, shortfall] = await Compound.read(
      _comptrollerAddress,
      "function getAccountLiquidity(address account) view returns (uint, uint, uint)",
      [account],
      { provider: providerUrl }
    );
  } catch (error) {
    console.error(error);
  }
  return liquidity / 1e18;
}

export async function _getCollateralFactor(
  _cTokenAddress: string,
  _comptrollerAddress: string
) {
  let isComped, isListed, collateralFactor;
  try {
    [isListed, isComped, collateralFactor] = await Compound.eth.read(
      _comptrollerAddress,
      "function getCollateralFactor(address cTokenAddress) view returns (bool, uint, bool)",
      [_cTokenAddress],
      { provider: providerUrl }
    );
  } catch (error) {
    console.error(error);
  }
  return (collateralFactor / 1e18) * 100;
}

export async function _borrowRatePerBlock(
  _cTokenAddress: string,
  underlyingDecimals: number
) {
  let borrowRatePerBlock;

  try {
    borrowRatePerBlock = await Compound.eth.read(
      _cTokenAddress,
      "function borrowRatePerBlock() returns (uint)",
      [],
      { provider: providerUrl }
    );
  } catch (error) {
    console.error(error);
  }
  return borrowRatePerBlock / Math.pow(10, underlyingDecimals);
}

export async function _borrowBalanceCurrent(
  _cTokenAddress: string,
  account: string,
  underlyingDecimals: number
) {
  let borrowBalance;

  try {
    borrowBalance = await Compound.eth.read(
      _cTokenAddress,
      "function borrowBalanceCurrent(address account) returns (uint)",
      [account],
      { provider: providerUrl }
    );
  } catch (error) {
    console.error(error);
  }

  return borrowBalance / Math.pow(10, underlyingDecimals);
}

export async function enterMarket() {
    console.log("\nEntering market (via Comptroller contract) for ETH (as collateral)...");
    let markets = [Compound.ETH];
    let tx = await compound.enterMarket(markets);
    await tx.wait(1);

    console.log("Entered Market", tx);
}

export async function _balanceOfUnderlying(cTokenAddress: string, account: string) {
    let balance;

    try {
        balance = await Compound.eth.read(
            cTokenAddress,
            "function balanceOfUnderlying() returns (uint)",
            [account],
            { provider: providerUrl}
        )
    } catch (error) {
        console.error(error);
        
    }
    return balance;
}

export async function _exchangeRateCurrent(req: Request, res: Response) {
    const { cToken}: any = req.query;
    const cTokenAddress = Compound.utils.getAddress(Compound[cToken]);
    let exchangeRate;
    try {
        exchangeRate = await Compound.eth.read(
            cTokenAddress,
            "function exchangeRateCurrent() return (uint)",
            [],
            { provider: providerUrl}
        )
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
        
    }
    const underlyingDecimals = Compound.decimals[cToken];
    exchangeRate = +exchangeRate / Math.pow(10, 18 + underlyingDecimals - 8);
    return res.json(exchangeRate);
}