const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  it("records a vote", async function () {
    const [, voter] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("Voting");
    const v = await Voting.deploy();
    await v.waitForDeployment();
    await v.connect(voter).vote();
    expect(await v.votes()).to.equal(1n);
  });
});
