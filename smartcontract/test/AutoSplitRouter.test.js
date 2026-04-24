import { expect } from "chai"

describe("AutoSplitRouter", async function () {
  const hardhat = await import("hardhat")
  const ethers = hardhat.default.ethers || hardhat.module.exports.ethers

  it("Should deploy and set split rules", async function () {
    const signers = await ethers.getSigners()
    const owner = signers[0]
    const user1 = signers[1]
    const user2 = signers[2]

    const AutoSplitRouterFactory = await ethers.getContractFactory("AutoSplitRouter")
    const router = await AutoSplitRouterFactory.deploy()
    await router.waitForDeployment()

    const recipients = [user1.address, user2.address]
    const basisPoints = [6000, 4000]
    const isVault = [false, false]

    await router.setSplitRules(recipients, basisPoints, isVault)

    const rules = await router.getSplitRules(owner.address)
    expect(rules[0]).to.deep.equal(recipients)
    expect(rules[1]).to.deep.equal(basisPoints)
    expect(rules[2]).to.deep.equal(isVault)
  })

  it("Should reject rules that don't sum to 100%", async function () {
    const AutoSplitRouterFactory = await ethers.getContractFactory("AutoSplitRouter")
    const router = await AutoSplitRouterFactory.deploy()
    await router.waitForDeployment()

    const ZeroAddress = "0x0000000000000000000000000000000000000000"

    await expect(
      router.setSplitRules(
        [ZeroAddress, ZeroAddress],
        [5000, 4000],
        [false, false]
      )
    ).to.be.revertedWith("Must sum to 100%")
  })
})
