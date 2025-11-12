import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import { OmegaVMAPI, KeyChain as OmegaVMKeyChain } from "../../src/apis/omegavm"
import {
  DELTAAPI,
  KeyChain as DELTAKeyChain,
  UnsignedTx,
  Tx,
  UTXOSet
} from "../../src/apis/delta"
import {
  Defaults,
  costImportTx
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()
const dchain: DELTAAPI = odyssey.DChain()
const oKeychain: OmegaVMKeyChain = ochain.keyChain()
const dHexAddress: string = process.env.WALLET_ADDRESS || "your_wallet_address_here"
const key = process.env.PRIVATE_KEY || "your_private_key_here"
const privKey: Buffer = new Buffer(key, "hex")
const dKeychain: DELTAKeyChain = dchain.keyChain()
oKeychain.importKey(privKey)
dKeychain.importKey(privKey)
const dAddressStrings: string[] = dchain.keyChain().getAddressStrings()
const oChainBlockchainId: string = Defaults.network[networkID].O.blockchainID

const main = async (): Promise<any> => {
  const baseFeeResponse: string = await dchain.getBaseFee()
  const baseFee = new BN(parseInt(baseFeeResponse, 16) / 1e9)
  let fee: BN = baseFee
  const deltaUTXOResponse: any = await dchain.getUTXOs(
    dAddressStrings,
    oChainBlockchainId
  )
  const utxoSet: UTXOSet = deltaUTXOResponse.utxos
  let unsignedTx: UnsignedTx = await dchain.buildImportTx(
    utxoSet,
    dHexAddress,
    dAddressStrings,
    oChainBlockchainId,
    dAddressStrings,
    fee
  )
  const importCost: number = costImportTx(unsignedTx)
  fee = baseFee.mul(new BN(importCost))

  unsignedTx = await dchain.buildImportTx(
    utxoSet,
    dHexAddress,
    dAddressStrings,
    oChainBlockchainId,
    dAddressStrings,
    fee
  )

  const tx: Tx = unsignedTx.sign(dKeychain)
  const txid: string = await dchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
