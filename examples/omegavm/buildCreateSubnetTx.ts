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
  DefaultLocalGenesisPrivateKey,
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
const privKey1: Buffer = new Buffer(DefaultLocalGenesisPrivateKey, "hex")
oKeychain.importKey(privKey1)

// Keypair B
let privKey = new Buffer("ab8523913b9963530eb05584dfe85fb63c2516a2b5b7c3aec9d000d716fb1534", "hex")
oKeychain.importKey(privKey)

// Keypair C
privKey = new Buffer("df3eb4d997116f9059dcac0a919431e5f38679f1953cb070516aece6f055034a", "hex")
oKeychain.importKey(privKey)

// Keypair D
privKey = new Buffer("fbb5cb9faccdaee01a44495be987eecbce6a62bd2342686940d2272399240b94", "hex")
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
