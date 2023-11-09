import _ from 'lodash'
import { solidity } from "ethereum-waffle"
import chai from "chai"
import { BigNumber, Signer, Wallet, constants, utils } from "ethers"
import { ethers, deployments } from "hardhat"
import {
  Oracle,
} from '../build/typechain'
import { increaseTimestamp } from './testUtils'

chai.use(solidity)
const { expect } = chai
const { get } = deployments

describe("Oracle", () => {
  let deployer: Wallet
  let oracle: Oracle

  const setupTest = deployments.createFixture(
    async ({ deployments, ethers, getChainId }) => {
      await deployments.fixture()

      const signers = await ethers.getSigners();
      [ deployer ] = signers

      oracle = (await ethers.getContractAt(
        "Oracle",
        (await get("Oracle")).address
      )) as Oracle
    }
  )

  beforeEach(async () => {
    await setupTest()
  })

  describe("setLatestPrice", () => {
    it('setLatestPrice', async () => {
      await oracle.setLatestPrice(1e8)
      const latestAnswer = await oracle.latestAnswer()
      expect(latestAnswer).eq(1e8)
    })
  })
})