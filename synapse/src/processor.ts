import { scaleDown } from '@sentio/sdk/lib/utils/token'
import { token,chain } from '@sentio/sdk/lib/utils'
import { SynapseProcessor, SynapseContext,DepositEvent,WithdrawEvent} from './types/synapse'
import {Tokens, ChainId} from "@synapseprotocol/sdk"


const Map: { [index: number]: [string, [string, string, number][]] } = {
  1: ["0x2796317b0fF8538F253012862c06787Adfb8cEb6",[
    ["WETH",String(Tokens.ETH.address(1)), Number(Tokens.ETH.decimals(1))],
    ["USDC", String(Tokens.USDC.address(1)), Number(Tokens.USDC.decimals(1))],
    ["USDT", String(Tokens.USDT.address(1)), Number(Tokens.USDT.decimals(1))],
    ["DAI", String(Tokens.DAI.address(1)), Number(Tokens.DAI.decimals(1))],
    ["FRAX", String(Tokens.FRAX.address(1)), Number(Tokens.FRAX.decimals(1))],
    ["nUSD", String(Tokens.NUSD.address(1)), Number(Tokens.NUSD.decimals(1))],
  ]],     // ethereum

  10: ["0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",[
    ["WETH",String(Tokens.ETH.address(10)), Number(Tokens.ETH.decimals(10))],
    ["USDC", String(Tokens.USDC.address(10)), Number(Tokens.USDC.decimals(10))],
    ["USDT", String(Tokens.USDT.address(10)), Number(Tokens.USDT.decimals(10))],
    ["DAI", String(Tokens.DAI.address(10)), Number(Tokens.DAI.decimals(10))],
    ["FRAX", String(Tokens.FRAX.address(10)), Number(Tokens.FRAX.decimals(10))],
    ["nUSD", String(Tokens.NUSD.address(10)), Number(Tokens.NUSD.decimals(10))],
  ]],     // optimism

  137: ["0x8F5BBB2BB8c2Ee94639E55d5F41de9b4839C1280",[
    ["WETH",String(Tokens.ETH.address(137)), Number(Tokens.ETH.decimals(137))],
    ["USDC", String(Tokens.USDC.address(137)), Number(Tokens.USDC.decimals(137))],
    ["USDT", String(Tokens.USDT.address(137)), Number(Tokens.USDT.decimals(137))],
    ["DAI", String(Tokens.DAI.address(137)), Number(Tokens.DAI.decimals(137))],
    ["FRAX", String(Tokens.FRAX.address(137)), Number(Tokens.FRAX.decimals(137))],
    ["nUSD", String(Tokens.NUSD.address(137)), Number(Tokens.NUSD.decimals(137))],
  ]],     // polygon

  42161: ["0x6F4e8eBa4D337f874Ab57478AcC2Cb5BACdc19c9",[
    ["WETH",String(Tokens.ETH.address(42161)), Number(Tokens.ETH.decimals(42161))],
    ["USDC", String(Tokens.USDC.address(42161)), Number(Tokens.USDC.decimals(42161))],
    ["USDT", String(Tokens.USDT.address(42161)), Number(Tokens.USDT.decimals(42161))],
    ["DAI", String(Tokens.DAI.address(42161)), Number(Tokens.DAI.decimals(42161))],
    ["FRAX", String(Tokens.FRAX.address(42161)), Number(Tokens.FRAX.decimals(42161))],
    ["nUSD", String(Tokens.NUSD.address(42161)), Number(Tokens.NUSD.decimals(42161))],
  ]],     // arbitrum

  43114: ["0xC05e61d0E7a63D27546389B7aD62FdFf5A91aACE",[
    ["WETH",String(Tokens.ETH.address(43114)), Number(Tokens.ETH.decimals(43114))],
    ["USDC", String(Tokens.USDC.address(43114)), Number(Tokens.USDC.decimals(43114))],
    ["USDT", String(Tokens.USDT.address(43114)), Number(Tokens.USDT.decimals(43114))],
    ["DAI", String(Tokens.DAI.address(43114)), Number(Tokens.DAI.decimals(43114))],
    ["FRAX", String(Tokens.FRAX.address(43114)), Number(Tokens.FRAX.decimals(43114))],
    ["nUSD", String(Tokens.NUSD.address(43114)), Number(Tokens.NUSD.decimals(43114))],
  ]],     // avalanche

  250:["0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",[
    ["WETH",String(Tokens.ETH.address(250)), Number(Tokens.ETH.decimals(250))],
    ["USDC", String(Tokens.USDC.address(250)), Number(Tokens.USDC.decimals(250))],
    ["USDT", String(Tokens.USDT.address(250)), Number(Tokens.USDT.decimals(250))],
    ["DAI", String(Tokens.DAI.address(250)), Number(Tokens.DAI.decimals(250))],
    ["FRAX", String(Tokens.FRAX.address(250)), Number(Tokens.FRAX.decimals(250))],
    ["nUSD", String(Tokens.NUSD.address(250)), Number(Tokens.NUSD.decimals(250))],
  ]] //fantom
}

const handleSwapIn = function (chainId: string,tokenName: string, decimal: number) {
  return async function (event: DepositEvent, ctx: SynapseContext) {
    const InAmount = scaleDown(event.args.amount,decimal)
    const dstChain = chain.getChainName(event.args.)
    ctx.meter.Gauge("transfer_out").record(OutAmount, { "token": tokenName, "dst": dstChain })
  }
}

/*
const handleSwapOut = function (tokenName: string, decimal: number,tokenAddr: string) {
  return async function (event: WithdrawEvent, ctx: SynapseContext) {
    const InAmount = scaleDown(event.args.amount, decimal)
    const srcChain = chain.getChainName(event.args.originChainId.toNumber())
    if (event.args.destinationToken==tokenAddr){
      ctx.meter.Gauge("transfer_in").record(InAmount, { "token": tokenName, "src": srcChain })
    }
  }
}
*/

