import "dotenv/config"
import { Odyssey, BinTools, BN, Buffer } from "../../src"
import {
  ALPHAAPI,
  SECPTransferOutput,
  SECPTransferInput,
  TransferableOutput,
  TransferableInput,
  UTXOSet,
  UTXO,
  AmountOutput,
  UnsignedTx,
  ALPHAConstants,
  OperationTx,
  TransferableOperation,
  Tx,
  KeyChain,
  NFTMintOperation,
  NFTMintOutput
} from "../../src/apis/alpha"
import { OutputOwners } from "../../src/common"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  Defaults
} from "../../src/utils"

// before you run this example buildCreateNFTAssetTx.ts

const getUTXOIDs = (
  utxoSet: UTXOSet,
  txid: string,
  outputType: number = ALPHAConstants.SECPXFEROUTPUTID_CODECONE,
  assetID = "2fombhL7aGPwj3KH4bfrmJwW6PVnMobf9Y2fn9GwxiAAJyFDbe"
): string[] => {
  const utxoids: string[] = utxoSet.getUTXOIDs()
  let result: string[] = []
  for (let index: number = 0; index < utxoids.length; ++index) {
    if (
      utxoids[index].indexOf(txid.slice(0, 10)) != -1 &&
      utxoSet.getUTXO(utxoids[index]).getOutput().getOutputID() == outputType &&
      assetID ==
        bintools.cb58Encode(utxoSet.getUTXO(utxoids[index]).getAssetID())
    ) {
      result.push(utxoids[index])
    }
  }
  return result
}

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
const operations: TransferableOperation[] = []
const fee: BN = achain.getDefaultTxFee()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from("ALPHA manual OperationTx to mint an NFT")
const payload: Buffer = Buffer.from("NFT Payload")
const groupID: number = 0
// Uncomment for codecID 00 01
// const codecID: number = 1

const main = async (): Promise<any> => {
  const alphaUTXOResponse: any = await achain.getUTXOs(aAddressStrings)
  const utxoSet: UTXOSet = alphaUTXOResponse.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  utxos.forEach((utxo: UTXO): void => {
    const txid: Buffer = utxo.getTxID()
    const outputidx: Buffer = utxo.getOutputIdx()
    const assetID: Buffer = utxo.getAssetID()
    if (
      utxo.getOutput().getTypeID() != 10 &&
      utxo.getOutput().getTypeID() != 11
    ) {
      const amountOutput: AmountOutput = utxo.getOutput() as AmountOutput
      const amt: BN = amountOutput.getAmount().clone()

      if (assetID.toString("hex") === dioneAssetIDBuf.toString("hex")) {
        const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
          amt.sub(fee),
          aAddresses,
          locktime,
          threshold
        )
        // Uncomment for codecID 00 01
        // secpTransferOutput.setCodecID(codecID)
        const transferableOutput: TransferableOutput = new TransferableOutput(
          dioneAssetIDBuf,
          secpTransferOutput
        )
        outputs.push(transferableOutput)

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
      } else {
        const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
          amt,
          aAddresses,
          locktime,
          threshold
        )
        // Uncomment for codecID 00 01
        // secpTransferOutput.setCodecID(codecID)
        const transferableOutput: TransferableOutput = new TransferableOutput(
          assetID,
          secpTransferOutput
        )
        outputs.push(transferableOutput)

        const secpTransferInput: SECPTransferInput = new SECPTransferInput(amt)
        // Uncomment for codecID 00 01
        // secpTransferInput.setCodecID(codecID)
        secpTransferInput.addSignatureIdx(0, aAddresses[0])
        const input: TransferableInput = new TransferableInput(
          txid,
          outputidx,
          assetID,
          secpTransferInput
        )
        inputs.push(input)
      }
    } else if (
      utxo.getOutput().getTypeID() != 7 &&
      utxo.getOutput().getTypeID() != 11
    ) {
      const outputOwners: OutputOwners = new OutputOwners(
        aAddresses,
        locktime,
        threshold
      )
      const nftMintOutputUTXOIDs: string[] = getUTXOIDs(
        utxoSet,
        bintools.cb58Encode(txid),
        ALPHAConstants.NFTMINTOUTPUTID,
        bintools.cb58Encode(assetID)
      )
      const mintOwner: NFTMintOutput = utxo.getOutput() as NFTMintOutput
      // Uncomment for codecID 00 01
      //   mintOwner.setCodecID(codecID)
      const nftMintOperation: NFTMintOperation = new NFTMintOperation(
        groupID,
        payload,
        [outputOwners]
      )
      //   Uncomment for codecID 00 01
      //   nftMintOperation.setCodecID(codecID)
      const spenders: Buffer[] = mintOwner.getSpenders(aAddresses)
      const nftMintOutputUTXOID: string = utxo.getUTXOID()
      if (nftMintOutputUTXOID === nftMintOutputUTXOIDs[0]) {
        spenders.forEach((spender: Buffer) => {
          const idx: number = mintOwner.getAddressIdx(spender)
          nftMintOperation.addSignatureIdx(idx, spender)
        })

        const transferableOperation: TransferableOperation =
          new TransferableOperation(
            utxo.getAssetID(),
            [nftMintOutputUTXOID],
            nftMintOperation
          )
        operations.push(transferableOperation)
      }
    }
  })
  const operationTx: OperationTx = new OperationTx(
    networkID,
    bintools.cb58Decode(blockchainID),
    outputs,
    inputs,
    memo,
    operations
  )
  // Uncomment for codecID 00 01
  //   operationTx.setCodecID(codecID)

  const unsignedTx: UnsignedTx = new UnsignedTx(operationTx)
  const tx: Tx = unsignedTx.sign(aKeychain)
  const txid: string = await achain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
