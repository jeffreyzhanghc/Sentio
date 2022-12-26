import { ERC20Context, ERC20Processor } from '@sentio/sdk/lib/builtin/erc20'
import { chain, conversion } from '@sentio/sdk/lib/utils';

import { BigDecimal } from '@sentio/sdk';

// import { X2y2Context, X2y2Processor } from './types/x2y2_processor'
import { AnyswapERC20Context, AnyswapERC20Processor } from "./types/anyswaperc20";
import { AnyswapRouterContext, AnyswapRouterProcessor } from './types/anyswaprouter';
import { LogAnySwapInEvent, LogAnySwapOut_address_address_address_uint256_uint256_uint256_Event, LogAnySwapOut_address_address_string_uint256_uint256_uint256_Event } from './types/anyswaprouter';
import { BscAnyswapRouterContext, BscAnyswapRouterProcessor } from './types/bscanyswaprouter';
// import { LogAnySwapInEvent as BscLogAnySwapInEvent, LogAnySwapOutEvent as BscLogAnySwapOutEvent } from './types/BscAnyswapRouter';
import { Bep20Context, Bep20Processor } from './types/bep20';

const startBlock = 14215845
const startBlock_BSC = 7910338

// ETH addresses
const anyEthAddress = "0x0615dbba33fe61a31c7ed131bda6655ed76748b1"
const routerAddress = "0xba8da9dcf11b50b03fd5284f164ef5cdef910705"
const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

// BSC addresses
const anyETHAddress_BSC = "0xdebb1d6a2196f2335ad51fbde7ca587205889360"
const routerAddress_BSC = "0xd1c5966f9f5ee6881ff6b261bbeda45972b1b5f3"
const wethAddress_BSC = "0x2170ed0880ac9a755fd29b2688956bd959f933f8"

var totalSupply: number = 0
const anyEthTotalSupplyProcessor = async function (_: any, ctx: AnyswapERC20Context) {
  totalSupply = Number((await ctx.contract.totalSupply()).toBigInt() / 10n ** 12n) / (10**6)

  ctx.meter.Gauge('anyETH_total_supply').record(totalSupply)
}

//netBalance is weth_balance - anyswap balance
const wethBalanceProcessor = async function (block: any, ctx: ERC20Context) {
  const balance = Number((await ctx.contract.balanceOf(anyEthAddress)).toBigInt() / 10n ** 12n) / (10**6)
  ctx.meter.Gauge('weth_balance').record(balance)
  ctx.meter.Gauge('netBalance_old').record(balance - totalSupply)
}

// netSwapFlow is defined as all anyswapOut events - anyswapIn events
const handleSwapIn = async function (event: LogAnySwapInEvent, ctx: AnyswapRouterContext) {
  const inAmount = conversion.toBigDecimal(event.args.amount).div(10**18)
  ctx.meter.Gauge('anyswapIn').record(inAmount, { "from": chain.getChainName(event.args.fromChainID.toString()) })
  ctx.meter.Counter('anyswapIn_cume').add(inAmount, { "from": chain.getChainName(event.args.fromChainID.toString()) })

  ctx.meter.Counter('netSwapFlow').sub(inAmount)
}

const handleSwapOut1 = async function (event: LogAnySwapOut_address_address_address_uint256_uint256_uint256_Event, ctx: AnyswapRouterContext) {
  const outAmount = conversion.toBigDecimal(event.args.amount).div(10**18)
  ctx.meter.Gauge('anyswapOut').record(outAmount, { "to": chain.getChainName(event.args.toChainID.toString()) })
  ctx.meter.Counter('anyswapOut_cume').add(outAmount, { "to": chain.getChainName(event.args.toChainID.toString())})

  ctx.meter.Counter('anyswapOutTotal').add(outAmount)
  ctx.meter.Counter('netSwapFlow').add(outAmount)
}

const handleSwapOut2 = async function (event: LogAnySwapOut_address_address_string_uint256_uint256_uint256_Event, ctx: AnyswapRouterContext) {
  const outAmount = conversion.toBigDecimal(event.args.amount).div(10**18)
  ctx.meter.Counter('anyswapOutTotal').add(outAmount)
  ctx.meter.Counter('netSwapFlow').add(outAmount)
  ctx.meter.Counter('anyswapOut_cume').add(outAmount, { "to": chain.getChainName(event.args.toChainID.toString())})
  ctx.meter.Gauge('anyswapOut').record(outAmount, { "to": chain.getChainName(event.args.toChainID.toString())})
}

// BSC handlers
// var TOTAL_SUPPLY_BSC: number = 0
// const anyEthTotalSupplyProcessorBSC = async function (_: any, ctx: Bep20Context) {
//   TOTAL_SUPPLY_BSC = Number((await ctx.contract.totalSupply()).toBigInt() / 10n ** 12n) / (10**6)

//   ctx.meter.Gauge('anyETH_bsc_total_supply').record(TOTAL_SUPPLY_BSC)
// }

//netBalance is weth_balance - anyswap balance
// const wethBalanceProcessorBSC = async function (block: any, ctx: Bep20Context) {
//   const balance = Number((await ctx.contract.balanceOf(anyETHAddress_BSC)).toBigInt() / 10n ** 12n) / (10**6)
//   ctx.meter.Gauge('weth_bsc_balance').record(balance)
//   ctx.meter.Gauge('netBalance_bsc').record(balance - TOTAL_SUPPLY_BSC)
// }

// netSwapFlow is defined as all anyswapOut events - anyswapIn events
// const handleSwapInBSC = async function (event: BscLogAnySwapInEvent, ctx: BscAnyswapRouterContext) {
//   const inAmount = conversion.toBigDecimal(event.args.amount).div(10**18)

//   ctx.meter.Counter('anyswapInTotal_bsc').add(inAmount)
//   ctx.meter.Counter('netSwapFlow_bsc').sub(inAmount)
// }

// const handleSwapOutBSC = async function (event: BscLogAnySwapOutEvent, ctx: BscAnyswapRouterContext) {
//   const outAmount = conversion.toBigDecimal(event.args.amount).div(10**18)

//   ctx.meter.Counter('anyswapOutTotal_bsc').add(outAmount)
//   ctx.meter.Counter('netSwapFlow_bsc').add(outAmount)
// }

const inFilter = AnyswapRouterProcessor.filters.LogAnySwapIn(null, anyEthAddress)
const outFilter1 = AnyswapRouterProcessor.filters['LogAnySwapOut(address,address,address,uint256,uint256,uint256)'](anyEthAddress)
const outFilter2 = AnyswapRouterProcessor.filters['LogAnySwapOut(address,address,string,uint256,uint256,uint256)'](anyEthAddress)

//BSC filters
const inFilterBSC = BscAnyswapRouterProcessor.filters.LogAnySwapIn(null, anyETHAddress_BSC)
const outFilterBSC = BscAnyswapRouterProcessor.filters.LogAnySwapOut(anyETHAddress_BSC)

AnyswapERC20Processor.bind({address: anyEthAddress, startBlock: 14215865})
  .onBlock(anyEthTotalSupplyProcessor)

ERC20Processor.bind({address: wethAddress, startBlock: startBlock})
  .onBlock(wethBalanceProcessor)

AnyswapRouterProcessor.bind({address: routerAddress, startBlock: startBlock})
  .onEventLogAnySwapIn(handleSwapIn, inFilter)
  .onEventLogAnySwapOut_address_address_address_uint256_uint256_uint256_(handleSwapOut1,outFilter1)
  .onEventLogAnySwapOut_address_address_string_uint256_uint256_uint256_(handleSwapOut2, outFilter2)

// BSC processors
// Bep20Processor.bind({address: anyETHAddress_BSC, network: 56, startBlock: startBlock_BSC})
// .onBlock(anyEthTotalSupplyProcessorBSC)

// Bep20Processor.bind({address: wethAddress_BSC, network: 56, startBlock: startBlock_BSC})
// .onBlock(wethBalanceProcessorBSC)

// BscAnyswapRouterProcessor.bind({address: routerAddress_BSC, network: 56, startBlock: startBlock_BSC})
//   .onEventLogAnySwapIn(handleSwapInBSC, inFilterBSC)
//   .onEventLogAnySwapOut(handleSwapOutBSC, outFilterBSC)

