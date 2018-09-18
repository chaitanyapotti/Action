var ActionTest = artifacts.require("./ActionTest.sol");
var TokenProportionalCappedTest = artifacts.require("electusvoting/contracts/testContracts/TokenProportionalCappedTest.sol");
var TokenProportionalUncappedTest = artifacts.require("electusvoting/contracts/testContracts/TokenProportionalUncappedTest.sol");
var ElectusProtocol = artifacts.require("electusvoting/contracts/protocol/Protocol.sol");
var TestToken = artifacts.require("electusvoting/contracts/Token/FreezableToken.sol");
const increaseTime = require("./utils/increaseTime");

contract("Action Test", function(accounts) {
  let protocol1Contract;
  let protocol2Contract;
  let protocol3Contract;
  let token1;
  let token2;
  let pollContract1;
  let pollContract2;
  let actionContract;

  beforeEach("setup", async () => {
    protocol1Contract = await ElectusProtocol.new("0x57616e636861696e", "0x57414e");
    await protocol1Contract.addAttributeSet(web3.fromAscii("hair"), [web3.fromAscii("black")]);
    await protocol1Contract.assignTo(accounts[1], [0], {
      from: accounts[0]
    });
    protocol2Contract = await ElectusProtocol.new("0x55532026204368696e61", "0x5543");
    await protocol2Contract.addAttributeSet(web3.fromAscii("hair"), [web3.fromAscii("black")]);
    await protocol2Contract.assignTo(accounts[2], [0], {
      from: accounts[0]
    });
    protocol3Contract = await ElectusProtocol.new("0x55532026204368696e61", "0x5543");
    await protocol3Contract.addAttributeSet(web3.fromAscii("hair"), [web3.fromAscii("black")]);
    await protocol3Contract.assignTo(accounts[2], [0], {
      from: accounts[0]
    });
    token1 = await TestToken.new();
    await token1.transfer(accounts[2], 100);
    token2 = await TestToken.new();
    await token2.transfer(accounts[2], 100);
    var presentTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
    const startTime = presentTime + 10000;
    pollContract1 = await TokenProportionalCappedTest.new(
      [protocol1Contract.address, protocol2Contract.address, protocol3Contract.address],
      ["0x68656c6c6f", "0x776f726c64"],
      token1.address,
      1,
      "0x57616e636861696e",
      "0x41646d696e20456c656374696f6e20466f722032303138",
      "0x4f6e6520506572736f6e204f6e6520566f7465",
      startTime,
      "0"
    );
    await token1.addAuthorized(pollContract1.address);
    pollContract2 = await TokenProportionalUncappedTest.new(
      [protocol1Contract.address, protocol2Contract.address, protocol3Contract.address],
      ["0x68656c6c6f", "0x776f726c64"],
      token2.address,
      "0x57616e636861696e",
      "0x41646d696e20456c656374696f6e20466f722032303138",
      "0x4f6e6520506572736f6e204f6e6520566f7465",
      startTime,
      "0"
    );
    await token2.addAuthorized(pollContract2.address);
    actionContract = await ActionTest.new([pollContract1.address, pollContract2.address], accounts[0]);
    await actionContract.sendTransaction({
      value: await web3.toWei("1", "ether").toString(),
      from: accounts[0]
    });
  });
  it("can execute method: returns 1", async () => {
    await increaseTime(10000);
    await pollContract1.vote("1", { from: accounts[2] });
    await pollContract2.vote("1", { from: accounts[2] });
    const execute = await actionContract.canExecute();
    assert.equal(web3.toDecimal(execute), 1);
  });
  it("can execute method: returns 0", async () => {
    await increaseTime(10000);
    await pollContract1.vote("1", { from: accounts[2] });
    const execute = await actionContract.canExecute();
    assert.equal(web3.toDecimal(execute), 0);
  });
  it("execute method: success", async () => {
    await increaseTime(10000);
    await pollContract1.vote("1", { from: accounts[2] });
    await pollContract2.vote("1", { from: accounts[2] });
    await actionContract.execute();
    const balance = web3.eth.getBalance(actionContract.address);
    assert.equal(web3.toDecimal(balance), 0);
  });
  it("execute method: failure", async () => {
    await increaseTime(10000);
    await pollContract1.vote("1", { from: accounts[2] });
    await actionContract.execute();
    const balance = web3.eth.getBalance(actionContract.address);
    assert.equal(web3.fromWei(balance.toString(), "ether"), 1);
  });
});
