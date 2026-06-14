import { CONTRACT_ADDRESSES } from '../constants';

export const CONTRACT_ADDRESS = {
  AUTO_SPLIT_ROUTER: CONTRACT_ADDRESSES.celo.AUTO_SPLIT_ROUTER,
  VAULT_ADAPTER: CONTRACT_ADDRESSES.celo.VAULT_ADAPTER,
  cUSD: CONTRACT_ADDRESSES.celo.cUSD,
};

export const AUTO_SPLIT_ROUTER_FUNCTIONS = {
  GET_SPLIT_RULES: "getSplitRules",
  SET_SPLIT_RULES: "setSplitRules",
  ROUTE_PAYMENT: "routePayment",
} as const;

export const VAULT_ADAPTER_FUNCTIONS = {
  GET_TREASURY_BALANCE: "getTreasuryBalance",
  DEPOSIT_TREASURY: "depositTreasury",
  WITHDRAW_TREASURY: "withdrawTreasury",
} as const;

export const ERC20_FUNCTIONS = {
  APPROVE: "approve",
} as const;
