import { BigNumber } from "bignumber.js/bignumber";
import { chain, token } from "@sentio/sdk/lib/utils";
import { MultichainRouterContext, MultichainRouterProcessor, LogAnySwapOutEvent, LogAnySwapInEvent } from "./types/multichainrouter";
import { CBridgeContext, CBridgeProcessor, SendEvent, RelayEvent } from "./types/cbridge";
import {
  HopBridgeContext, HopBridgeProcessor, TransferSentEvent,
  WithdrawalBondedEvent as WithdrawalBondedL2Event
} from "./types/hopbridge";
import {
  HopBridgeEthereumContext, HopBridgeEthereumProcessor, TransferSentToL2Event,
  WithdrawalBondedEvent as WithdrawalBondedEthereumEvent
} from "./types/hopbridgeethereum";
import { StargatePoolContext, StargatePoolProcessor, SwapEvent, SwapRemoteEvent } from "./types/stargatepool";
import { AcrossToContext, AcrossToProcessor, FundsDepositedEvent, FilledRelayEvent,TokensBridgedEvent } from "./types/acrossto";
import { MultichainMap, CBridgeMap, HopMap, StargateMap, AcrossMap } from "./addresses";

const EthPrice = 1200

const mapOrder = function (value: BigNumber): string {
  if (value.lte(1)) return "bot (<$1)";
  else if (value.gt(1) && value.lte(100)) return "small ($1~$100)";
  else if (value.gt(100) && value.lte(3000)) return "medium ($100~$3k)";
  else return "large (>$3k)";
}
const generateLabel = function (
  chainName: string,
  tokenName: string,
  bridge: string,
  isOut: boolean
): { [index: string]: string } {
  if (isOut) return {
    "src": chainName,
    "token": tokenName,
    "bridge": bridge,
  }; else return {
    "dst": chainName,
    "token": tokenName,
    "bridge": bridge,
  }
}


// ================================= Hop =================================
const handleSwapOutHop = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "Hop", true)
  return async function (
    event: TransferSentEvent | TransferSentToL2Event,
    ctx: HopBridgeContext | HopBridgeEthereumContext
  ) {
    var value = token.scaleDown(event.args.amount, decimal)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
    ctx.meter.Gauge("swapOutAmount").record(value, labelAmount)
    ctx.meter.Gauge("swapOutType").record(1, {...labelAmount, "type": mapOrder(value)})
  }
}

const handleSwapInHop = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "Hop", false)
  return async function (
    event: WithdrawalBondedEthereumEvent | WithdrawalBondedL2Event,
    ctx: HopBridgeContext | HopBridgeEthereumContext
  ) {
    var value = token.scaleDown(event.args.amount, decimal)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
    ctx.meter.Gauge("swapInAmount").record(value, labelAmount)
    ctx.meter.Gauge("swapInType").record(1, {...labelAmount, "type": mapOrder(value)})
  }
}

for (const [chainId, tokenList] of Object.entries(HopMap)) {
  if (Number(chainId) == 1) {
    for (const [tokenName, tokenAddr, decimal] of tokenList) {
      HopBridgeEthereumProcessor.bind({ address: tokenAddr, network: Number(chainId) })
        .onEventTransferSentToL2(handleSwapOutHop(chainId, tokenName, decimal))
        .onEventWithdrawalBonded(handleSwapInHop(chainId, tokenName, decimal))
    }
  } else {
    for (const [tokenName, tokenAddr, decimal] of tokenList) {
      HopBridgeProcessor.bind({ address: tokenAddr, network: Number(chainId) })
        .onEventTransferSent(handleSwapOutHop(chainId, tokenName, decimal))
        .onEventWithdrawalBonded(handleSwapInHop(chainId, tokenName, decimal))
    }
  }
}


// ================================= AcrossTo =================================
const handleSwapOutAcross = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "AcrossTo", true)
  return async function (event: FundsDepositedEvent, ctx: AcrossToContext) {
    var value = token.scaleDown(event.args.amount, decimal)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
    ctx.meter.Gauge("swapOutAmount").record(value, labelAmount)
    ctx.meter.Gauge("swapOutType").record(1, {...labelAmount, "type": mapOrder(value)})
  }
}

const handleSwapOutAcrossuguigiu = function (chainId: string, tokenName: string, decimal: number) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "AcrossTo", true)
  return async function (event: TokensBridgedEvent, ctx: AcrossToContext) {
    var value = token.scaleDown(event.args., decimal)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
    ctx.meter.Gauge("swapOutAmount").record(value, labelAmount)
    ctx.meter.Gauge("swapOutType").record(1, {...labelAmount, "type": mapOrder(value)})
  }
}

const handleSwapInAcross = function (chainId: string, tokenName: string, decimal: number, tokenAddr: string) {
  const chainName = chain.getChainName(chainId).toLowerCase()
  const labelAmount = generateLabel(chainName, tokenName, "AcrossTo", false)
  return async function (event: FilledRelayEvent, ctx: AcrossToContext) {
    var value = token.scaleDown(event.args.amount, decimal)
    if (tokenName == "ETH") value = value.multipliedBy(EthPrice)
    if (event.args.destinationToken == tokenAddr) {
      ctx.meter.Gauge("swapInAmount").record(value, labelAmount)
      ctx.meter.Gauge("swapInType").record(1, {...labelAmount, "type": mapOrder(value)})
    }
  }
}

for (const [chainId, [poolAddr, tokenList]] of Object.entries(AcrossMap)) {
  for (const [tokenName, tokenAddr, decimal] of tokenList) {
    AcrossToProcessor.bind({ address: poolAddr, network: Number(chainId) })
      .onEventFundsDeposited(
        handleSwapOutAcross(chainId, tokenName, decimal),
        AcrossToProcessor.filters.FundsDeposited(null, null, null, null, null, null, tokenAddr)
      )
      .onEventFilledRelay(
        handleSwapInAcross(chainId, tokenName, decimal, tokenAddr)
      )
  }
}