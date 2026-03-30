import "dotenv/config"
import { GetUTXOsResponse } from "../../src/apis/alpha/interfaces"
import { Odyssey, BN, Buffer } from "../../src"
import {
  ALPHAAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx
} from "../../src/apis/alpha"
import { UnixNow } from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()
const aKeychain: KeyChain = achain.keyChain()
const amount = process.env.AMOUNT || "5"
const key = process.env.PRIVATE_KEY || "your_private_key_here"
const privKey: Buffer = new Buffer(key, "hex");
aKeychain.importKey(privKey)
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
const asOf: BN = UnixNow()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "ALPHA utility method buildBaseTx to send an ANT"
)

const main = async (): Promise<any> => {
  const alphaUTXOResponse: GetUTXOsResponse = await achain.getUTXOs(
    aAddressStrings
  )
  const utxoSet: UTXOSet = alphaUTXOResponse.utxos
  const assetID: string = "KD4byR998qmVivF2zmrhLb6gjwKGSB5xCerV2nYXb4XNXVGEP"
  const toAddresses: string[] = [aAddressStrings[0]]

  const unsignedTx: UnsignedTx = await achain.buildBaseTx(
    utxoSet,
    new BN(amount),
    assetID,
    toAddresses,
    aAddressStrings,
    aAddressStrings,
    memo,
    asOf,
    locktime,
    threshold
  )

  const tx: Tx = unsignedTx.sign(aKeychain)
  const txid: string = await achain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
