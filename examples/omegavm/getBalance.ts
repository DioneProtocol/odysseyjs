import "dotenv/config"
import { Odyssey } from "../../src"
import { OmegaVMAPI } from "../../src/apis/omegavm"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()

const main = async (): Promise<any> => {
  const address: string[] = ["O-testnet1fakfvvmttwg575xyjuy07y3l86c9lkxsuqa6nc"]
  const balance: object = await ochain.getBalance(address)
  console.log(balance)
}

main()
