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
let privKey: Buffer = new Buffer(DefaultLocalGenesisPrivateKey, "hex")
oKeychain.importKey(privKey)

// Keypair B
privKey = new Buffer("ab8523913b9963530eb05584dfe85fb63c2516a2b5b7c3aec9d000d716fb1534", "hex")
oKeychain.importKey(privKey)

// Keypair D
privKey = new Buffer("df3eb4d997116f9059dcac0a919431e5f38679f1953cb070516aece6f055034a", "hex")
oKeychain.importKey(privKey)

// Keypair D
privKey = new Buffer("fbb5cb9faccdaee01a44495be987eecbce6a62bd2342686940d2272399240b94", "hex")
oKeychain.importKey(privKey)
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const nodeID: string = "NodeID-7sECFXYT5k6VR4LzHRhFbqWdPcSBnXfK3"
const startTime: BN = UnixNow().add(new BN(60 * 1))
const endTime: BN = startTime.add(new BN(1000))
const asOf: BN = UnixNow()

const main = async (): Promise<any> => {
  const omegaVMUTXOResponse: GetUTXOsResponse = await ochain.getUTXOs(
    oAddressStrings
  )
  const oAddresses: Buffer[] = ochain.keyChain().getAddresses()
  const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos

  const weight: BN = new BN(1)
  const subnetID: string = "2ivEh5xHybHhusC2ZzXY7EY99SuR8s2Vet7qwuTsazvnj2VXg2"
  const memo: Buffer = Buffer.from(
    "Utility function to create a AddSubnetValidatorTx transaction"
  )
  const subnetAuthCredentials: [number, Buffer][] = [
    [0, oAddresses[3]],
    [1, oAddresses[1]]
  ]
  const unsignedTx: UnsignedTx = await ochain.buildAddSubnetValidatorTx(
    utxoSet,
    oAddressStrings,
    oAddressStrings,
    nodeID,
    startTime,
    endTime,
    weight,
    subnetID,
    memo,
    asOf,
    subnetAuthCredentials
  )
  const tx: Tx = unsignedTx.sign(oKeychain)
  const txid: string = await ochain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
