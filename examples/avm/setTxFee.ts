import "dotenv/config"
import { Avalanche, BN } from "../../src"
import { AVMAPI } from "../../src/apis/avm"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const avalanche: Avalanche = new Avalanche(ip, port, protocol, networkID)
const xchain: AVMAPI = avalanche.XChain()

const main = async (): Promise<any> => {
  const fee: BN = new BN(507)
  xchain.setTxFee(fee)
  const txFee: BN = xchain.getTxFee()
  console.log(txFee)
}

main()
