import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import {
  ALPHAAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx
} from "../../src/apis/alpha"
import {
  GetBalanceResponse,
  GetUTXOsResponse
} from "../../src/apis/alpha/interfaces"
import { Defaults } from "../../src/utils"
import {
  DefaultLocalGenesisPrivateKey,
  UnixNow
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const aBlockchainID: string = Defaults.network[networkID].A.blockchainID
const dioneAssetID: string = Defaults.network[networkID].A.dioneAssetID
const odyssey: Odyssey = new Odyssey(
  ip,
  port,
  protocol,
  networkID,
  aBlockchainID
)
const achain: ALPHAAPI = odyssey.AChain()
const aKeychain: KeyChain = achain.keyChain()
const privKey: Buffer = new Buffer(DefaultLocalGenesisPrivateKey, "hex")
aKeychain.importKey(privKey)
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
const asOf: BN = UnixNow()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "ALPHA utility method buildBaseTx to send DIONE"
)
const fee: BN = achain.getDefaultTxFee()

const main = async (): Promise<any> => {
  const getBalanceResponse: GetBalanceResponse = await achain.getBalance(
    aAddressStrings[0],
    dioneAssetID
  )
  const balance: BN = new BN(getBalanceResponse.balance)
  const alphaUTXOResponse: GetUTXOsResponse = await achain.getUTXOs(
    aAddressStrings
  )
  const utxoSet: UTXOSet = alphaUTXOResponse.utxos
  // const amount: BN = balance.sub(fee)
  console.log(balance.toString())
  console.log(fee.toString())
  const amount: BN = new BN(50000000000)
  const toAddresses: [string] = [
    "A-testnet1zgjm3xv0qy62tevqztz86qyz78q7cl0e38zkaw"
  ]

  const unsignedTx: UnsignedTx = await achain.buildBaseTx(
    utxoSet,
    amount,
    dioneAssetID,
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
