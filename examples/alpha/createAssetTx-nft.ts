import "dotenv/config"
import { Odyssey, BinTools, BN, Buffer } from "../../src"
import {
  ALPHAAPI,
  KeyChain,
  SECPTransferOutput,
  SECPTransferInput,
  TransferableOutput,
  TransferableInput,
  UTXOSet,
  UTXO,
  AmountOutput,
  UnsignedTx,
  Tx,
  CreateAssetTx,
  InitialStates,
  ALPHAConstants,
  MinterSet,
  NFTMintOutput
} from "../../src/apis/alpha"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  Defaults
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()
const bintools: BinTools = BinTools.getInstance()
const aKeychain: KeyChain = achain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
aKeychain.importKey(privKey)
const aAddresses: Buffer[] = achain.keyChain().getAddresses()
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
const blockchainID: string = Defaults.network[networkID].A.blockchainID
const dioneAssetID: string = Defaults.network[networkID].A.dioneAssetID
const dioneAssetIDBuf: Buffer = bintools.cb58Decode(dioneAssetID)
const outputs: TransferableOutput[] = []
const inputs: TransferableInput[] = []
const fee: BN = achain.getDefaultTxFee()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from("ALPHA manual CreateAssetTx to create an NFT")
const name: string = "non fungible token"
const symbol: string = "NFT"
const denomination: number = 0 // NFTs are non-fungible
const groupID: number = 0
// Uncomment for codecID 00 01
// const codecID: number = 1

const main = async (): Promise<any> => {
  const getBalanceResponse: any = await achain.getBalance(
    aAddressStrings[0],
    dioneAssetID
  )
  const balance: BN = new BN(getBalanceResponse.balance)
  const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
    balance.sub(fee),
    aAddresses,
    locktime,
    threshold
  )
  // Uncomment for codecID 00 01
  //   secpTransferOutput.setCodecID(codecID)
  const transferableOutput: TransferableOutput = new TransferableOutput(
    dioneAssetIDBuf,
    secpTransferOutput
  )
  outputs.push(transferableOutput)

  const alphaUTXOResponse: any = await achain.getUTXOs(aAddressStrings)
  const utxoSet: UTXOSet = alphaUTXOResponse.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  utxos.forEach((utxo: UTXO): void => {
    const outputID: number = utxo.getOutput().getTypeID()
    const assetID: Buffer = utxo.getAssetID()
    if (
      outputID === 7 &&
      assetID.toString("hex") === dioneAssetIDBuf.toString("hex")
    ) {
      const amountOutput: AmountOutput = utxo.getOutput() as AmountOutput
      const amt: BN = amountOutput.getAmount().clone()
      const txid: Buffer = utxo.getTxID()
      const outputidx: Buffer = utxo.getOutputIdx()

      const secpTransferInput: SECPTransferInput = new SECPTransferInput(amt)
      // Uncomment for codecID 00 01
      // secpTransferInput.setCodecID(codecID)
      secpTransferInput.addSignatureIdx(0, aAddresses[0])

      const input: TransferableInput = new TransferableInput(
        txid,
        outputidx,
        dioneAssetIDBuf,
        secpTransferInput
      )
      inputs.push(input)
    }
  })

  const initialStates: InitialStates = new InitialStates()
  const minterSets: MinterSet[] = [new MinterSet(threshold, aAddresses)]
  for (let i: number = 0; i <= 5; i++) {
    const nftMintOutput: NFTMintOutput = new NFTMintOutput(
      groupID,
      minterSets[0].getMinters(),
      locktime,
      minterSets[0].getThreshold()
    )
    // Uncomment for codecID 00 01
    // nftMintOutput.setCodecID(codecID)
    initialStates.addOutput(nftMintOutput, ALPHAConstants.NFTFXID)
  }

  const createAssetTx: CreateAssetTx = new CreateAssetTx(
    networkID,
    bintools.cb58Decode(blockchainID),
    outputs,
    inputs,
    memo,
    name,
    symbol,
    denomination,
    initialStates
  )
  // Uncomment for codecID 00 01
  // createAssetTx.setCodecID(codecID)
  const unsignedTx: UnsignedTx = new UnsignedTx(createAssetTx)
  const tx: Tx = unsignedTx.sign(aKeychain)
  const txid: string = await achain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
