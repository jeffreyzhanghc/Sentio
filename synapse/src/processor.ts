import { scaleDown } from '@sentio/sdk/lib/utils/token'
import { token,chain } from '@sentio/sdk/lib/utils'
import { SynapseProcessor, SynapseContext,TokenDepositAndSwapEvent,TokenDepositEvent,TokenMintEvent,TokenMintAndSwapEvent,TokenRedeemAndSwapEvent,TokenWithdrawAndRemoveEvent} from './types/synapse'
import {Tokens, ChainId} from "@synapseprotocol/sdk"


const Map: { [index: number]: [string, [number,string, string, number][]] } = {
  1: ["0x2796317b0fF8538F253012862c06787Adfb8cEb6",[
    [1,"USDC", String(Tokens.USDC.address(1)), 6],
    [2,"USDT", String(Tokens.USDT.address(1)), 6],
  ]],     // ethereum

  10: ["0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",[
    [1,"USDC", String(Tokens.USDC.address(10)), 6],
    [2,"USDT", String(Tokens.USDT.address(10)), 6],
  ]],     // optimism

  137: ["0x8F5BBB2BB8c2Ee94639E55d5F41de9b4839C1280",[
    [1,"USDC", String(Tokens.USDC.address(137)), 6],
    [2,"USDT", String(Tokens.USDT.address(137)), 6],
  ]],     // polygon

  42161: ["0x6F4e8eBa4D337f874Ab57478AcC2Cb5BACdc19c9",[
    [1,"USDC", String(Tokens.USDC.address(42161)), 6],
    [2,"USDT", String(Tokens.USDT.address(42161)), 6],
  ]],     // arbitrum

  43114: ["0xC05e61d0E7a63D27546389B7aD62FdFf5A91aACE",[
    [1,"USDC", String(Tokens.USDC.address(43114)), 6],
    [2,"USDT", String(Tokens.USDT.address(43114)), 6],
  ]],     // avalanche

  250:["0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",[
    [1,"USDC", String(Tokens.USDC.address(250)), 6],
    [2,"USDT", String(Tokens.USDT.address(250)), 6],
  ]] //fantom
}
const EthPrice = 1200


const handleSwapOut = function (chainId: string,tokenName: string, decimal: number,tokenidx:number) {
  return async function (event: TokenDepositAndSwapEvent, ctx: SynapseContext) {
    var OutAmount = scaleDown(event.args.amount,decimal)
    const dstChain = chain.getChainName(event.args.chainId.toNumber())
    if (event.args.tokenIndexTo == tokenidx){
        ctx.meter.Gauge("transfer_out").record(OutAmount, { "token": tokenName, "dst": dstChain})
    }
  }
}



for (const [chainId, [poolAddr, tokenList]] of Object.entries(Map)) {
    for (const [tokenidx,tokenName, tokenAddr, decimal] of tokenList) {
      SynapseProcessor.bind({ address: poolAddr, network: Number(chainId) })
        .onEventTokenDepositAndSwap(
          handleSwapOut(chainId, tokenName, decimal,tokenidx),
        )
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
