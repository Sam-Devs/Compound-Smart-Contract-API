import express from "express";
import { BorrowErc20WithEth } from "../handlers/balance";
import { BorrowEthWithErc20 } from "../handlers/borrow/borrow-eth-with-erc20";
import { RepayBorrow } from "../handlers/repay/repay";
import { RedeemToken } from "../handlers/supply/redeem";
import { SupplyErc20 } from "../handlers/supply/supply-erc20";
import { SupplyEther } from "../handlers/supply/supply-eth";
import { _exchangeRateCurrent } from "../utils";
const router = express.Router();

router.post("/borrow-erc20", BorrowErc20WithEth);
router.post("/borrow-eth", BorrowEthWithErc20);
router.post("/repay", RepayBorrow);
router.post("/supply-erc20", SupplyErc20);
router.post("/supply-eth", SupplyEther);
router.post("/redeem-eth", RedeemToken);
router.get("/exchange-rate", _exchangeRateCurrent);

export default router;