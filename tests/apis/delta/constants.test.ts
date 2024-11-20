import { BN } from "src"
import { Defaults, Networks, Network } from "../../../src/utils/constants"

describe("DELTAConstants", (): void => {
  describe("Compare min and max gas prices", (): void => {
    const networks: Networks = Defaults.network
    const minNum: number = 238095238095238
    const maxNum: number = 714285714285714
    const networkIDs: number[] = [1, 5, 12345]
    networkIDs.forEach((networkID: number): void => {
      test(`NetworkID: ${networkID}`, async (): Promise<void> => {
        const localNetwork: Network = networks[networkID]

        const minGasPriceBN: BN = localNetwork.D.minGasPrice
        const minGasPriceNum: number = new BN(minGasPriceBN).toNumber()

        const maxGasPriceBN: BN = localNetwork.D.maxGasPrice
        const maxGasPriceNum: number = new BN(maxGasPriceBN).toNumber()

        expect(minGasPriceNum).toBeLessThanOrEqual(maxGasPriceNum)
        expect(minGasPriceNum).toEqual(minNum)
        expect(minGasPriceBN.isEven()).toBeTruthy()
        expect(minGasPriceBN.isNeg()).toBeFalsy()

        expect(maxGasPriceNum).toBeGreaterThanOrEqual(minGasPriceNum)
        expect(maxGasPriceNum).toEqual(maxNum)
        expect(maxGasPriceBN.isEven()).toBeTruthy()
        expect(maxGasPriceBN.isNeg()).toBeFalsy()
      })
    })
  })
})
