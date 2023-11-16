import "dotenv/config"
import { Odyssey } from "../../src"
import { EVMAPI } from "../../src/apis/evm"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const cchain: EVMAPI = odyssey.CChain()

const main = async (): Promise<any> => {
  const txID: string = "FCry2Z1Su9KZqK1XRMhxQS6XuPorxDm3C3RBT7hw32ojiqyvP"
  const status: string = await cchain.getAtomicTxStatus(txID)
  console.log(status)
}

main()
