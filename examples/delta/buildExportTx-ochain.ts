import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import {
  OmegaVMAPI,
  KeyChain as OmegaKeyChain
} from "../../src/apis/omegavm"
import {
  DELTAAPI,
  KeyChain as DELTAKeyChain,
  UnsignedTx,
  Tx
} from "../../src/apis/delta"
import {
  Defaults,
  costExportTx
} from "../../src/utils"
import { Web3 } from "web3"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()
const dchain: DELTAAPI = odyssey.DChain()
const key = process.env.PRIVATE_KEY || "your_private_key_here"
const privKey: Buffer = new Buffer(key, "hex")
const oKeychain: OmegaKeyChain = ochain.keyChain()
const dKeychain: DELTAKeyChain = dchain.keyChain()
oKeychain.importKey(privKey)
dKeychain.importKey(privKey)
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
console.log(oAddressStrings)
const dAddressStrings: string[] = dchain.keyChain().getAddressStrings()
const oChainBlockchainIdStr: string = Defaults.network[networkID].O.blockchainID
const dioneAssetID: string = Defaults.network[networkID].A.dioneAssetID || "your_dione_asset_id_here"
const dHexAddress: string = process.env.WALLET_ADDRESS || "your_wallet_address_here"
const path: string = "/ext/bc/D/rpc"
const web3: any = new Web3(`${protocol}://${ip}:${port}${path}`)
const threshold: number = 1

const main = async (): Promise<any> => {
  const baseFeeResponse: string = await dchain.getBaseFee()
  const baseFee = new BN(parseInt(baseFeeResponse, 16))
  const txcount = await web3.eth.getTransactionCount(dHexAddress)
  const nonce: number = Number(txcount)
  const locktime: BN = new BN(0)
  let dioneAmount: BN = new BN(process.env.AMOUNT || "20000000000")
  let fee: BN = baseFee.div(new BN(1e9))
  fee = fee.add(new BN(1))

  let unsignedTx: UnsignedTx = await dchain.buildExportTx(
    dioneAmount,
    dioneAssetID,
    oChainBlockchainIdStr,
    dHexAddress,
    dAddressStrings[0],
    oAddressStrings,
    nonce,
    locktime,
    threshold,
    fee
  )
  const exportCost: number = costExportTx(unsignedTx)
  fee = fee.mul(new BN(exportCost))

  unsignedTx = await dchain.buildExportTx(
    dioneAmount,
    dioneAssetID,
    oChainBlockchainIdStr,
    dHexAddress,
    dAddressStrings[0],
    oAddressStrings,
    nonce,
    locktime,
    threshold,
    fee
  )

  const tx: Tx = unsignedTx.sign(dKeychain)
  const txid: string = await dchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
