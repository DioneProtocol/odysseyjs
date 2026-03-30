import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import {
  OmegaVMAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx
} from "../../src/apis/omegavm"
import { GetUTXOsResponse } from "../../src/apis/omegavm/interfaces"
import {

  UnixNow
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()
// Keychain with 4 keys-A, B, D, and D
const oKeychain: KeyChain = ochain.keyChain()
// Keypair A
const key = process.env.PRIVATE_KEY || "your_private_key_here"
const privKey1: Buffer = new Buffer(key, "hex")
oKeychain.importKey(privKey1)

// Keypair B
let privKey = new Buffer(process.env.PRIVATE_KEY_B || "your_private_key_b_here", "hex")
oKeychain.importKey(privKey)

// Keypair C
privKey = new Buffer(process.env.PRIVATE_KEY_C || "your_private_key_c_here", "hex")
oKeychain.importKey(privKey)

// Keypair D
privKey = new Buffer(process.env.PRIVATE_KEY_D || "your_private_key_d_here", "hex")
oKeychain.importKey(privKey)
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const threshold: number = 2
const memo: Buffer = Buffer.from(
  "OmegaVM utility method buildCreateSubnetTx to create a CreateSubnetTx which creates a 1-of-2 DIONE utxo and a 2-of-3 SubnetAuth"
)
const asOf: BN = UnixNow()
const subnetAuthKeychain: string[] = [
  oAddressStrings[1],
  oAddressStrings[2],
  oAddressStrings[3]
]

const main = async (): Promise<any> => {
  const omegaVMUTXOResponse: GetUTXOsResponse = await ochain.getUTXOs(
    oAddressStrings
  )
  const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos

  const unsignedTx: UnsignedTx = await ochain.buildCreateSubnetTx(
    utxoSet,
    oAddressStrings,
    oAddressStrings,
    subnetAuthKeychain,
    threshold,
    memo,
    asOf
  )

  const tx: Tx = unsignedTx.sign(oKeychain)
  const txid: string = await ochain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
