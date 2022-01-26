const BookMarketplace = artifacts.require("BookMarketplace");
const { catchRevert } = require("./utils/exceptions");

// Mocha - testing framework
// Chai - assertion JS library

const getBalance = async (address) => web3.eth.getBalance(address);
const toBN = (value) => web3.utils.toBN(value);
const getGas = async (result) => {
  // we need to pass the hash Identifier which we get from the result object
  const tx = await web3.eth.getTransaction(result.tx);
  console.log("tx", tx);
  // gasUsed how many gas used. gascost=gasUsed * gasPrice
  const gasUsed = toBN(result.receipt.gasUsed);
  const gasPrice = toBN(tx.gasPrice);
  // gasUsed is BN object
  const gas = gasUsed.mul(gasPrice);
  return gas;
};

contract("BookMarketplace", (accounts) => {
  // bookId and prrof are manually created
  const bookId = "0x00000000000000000000000000003130";
  const proof =
    "0x0000000000000000000000000000313000000000000000000000000000003130";
  const bookId2 = "0x00000000000000000000000000002130";
  const proof2 =
    "0x0000000000000000000000000000213000000000000000000000000000002130";
  const value = "900000000";

  let _contract = null;
  let contractOwner = null;
  let buyer = null;
  let bookHash = null;

  before(async () => {
    _contract = await BookMarketplace.deployed();
    contractOwner = accounts[0];
    buyer = accounts[1];
  });

  describe("Purchase the new book", () => {
    before(async () => {
      await _contract.purchaseBook(bookId, proof, {
        from: buyer,
        value,
      });
    });

    it("should NOT allow to repurchase already owned book", async () => {
      await catchRevert(
        _contract.purchaseBook(bookId, proof, { from: buyer, value })
      );
    });

    it("can get the purchased book hash by index", async () => {
      const index = 0;
      bookHash = await _contract.getBookHashAtIndex(index);
      const expectedHash = web3.utils.soliditySha3(
        { type: "bytes16", value: bookId },
        { type: "address", value: buyer }
      );

      assert.equal(
        bookHash,
        expectedHash,
        "Book hash is not maching the hash of purchased book!"
      );
    });

    it("should match the data of the book purchased by buyer", async () => {
      const exptectedIndex = 0;
      const exptectedState = 0;
      const book = await _contract.getBookByHash(bookHash);

      assert.equal(book.id, exptectedIndex, "Book index should be 0!");
      assert.equal(book.price, value, `Book price should be ${value}!`);
      assert.equal(book.proof, proof, `Book proof should be ${proof}!`);
      assert.equal(book.owner, buyer, `Book buyer should be ${buyer}!`);
      assert.equal(
        book.state,
        exptectedState,
        `Book state should be ${exptectedState}!`
      );
    });
  });

  describe("Activate the purchased book", () => {
    it("should NOT be able to activate book by NOT contract owner", async () => {
      await catchRevert(_contract.activateBook(bookHash, { from: buyer }));
    });

    it("should have 'activated' state", async () => {
      await _contract.activateBook(bookHash, { from: contractOwner });
      const book = await _contract.getBookByHash(bookHash);
      const exptectedState = 1;

      assert.equal(
        book.state,
        exptectedState,
        "Book should have 'activated' state"
      );
    });
  });

  describe("Transfer ownership", () => {
    let currentOwner = null;

    before(async () => {
      currentOwner = await _contract.getContractOwner();
    });

    it("getContractOwner should return deployer address", async () => {
      assert.equal(
        contractOwner,
        currentOwner,
        "Contract owner is not matching the one from getContractOwner function"
      );
    });

    it("should NOT transfer ownership when contract owner is not sending TX", async () => {
      await catchRevert(
        _contract.transferOwnership(accounts[3], { from: accounts[4] })
      );
    });

    it("should transfer owership to 3rd address from 'accounts'", async () => {
      await _contract.transferOwnership(accounts[2], { from: currentOwner });
      const owner = await _contract.getContractOwner();
      assert.equal(
        owner,
        accounts[2],
        "Contract owner is not the second account"
      );
    });

    it("should transfer owership back to initial contract owner'", async () => {
      await _contract.transferOwnership(contractOwner, { from: accounts[2] });
      const owner = await _contract.getContractOwner();
      assert.equal(owner, contractOwner, "Contract owner is not set!");
    });
  });

  describe("Deactivate book", () => {
    let bookHash2 = null;
    let currentOwner = null;
    before(async () => {
      await _contract.purchaseBook(bookId2, proof2, { from: buyer, value });
      bookHash2 = await _contract.getBookHashAtIndex(1);
      currentOwner = await _contract.getContractOwner();
    });

    it("should not be able to deactivate book by NOT contract owner", async () => {
      // only contract owner should be able to deactivate book
      await catchRevert(_contract.deactivateBook(bookHash2, { from: buyer }));
    });
    it("should have status of deactivated and price is 0", async () => {
      const beforeTXBuyerBalance = await getBalance(buyer);
      console.log("type of ", typeof beforeTXBuyerBalance);
      const beforeTXContractBalance = await getBalance(_contract.address);
      const beforeTXOwnerBalance = await getBalance(currentOwner);
      // only contract owner should be able to deactivate book
      const result = await _contract.deactivateBook(bookHash2, {
        from: contractOwner,
      });
      const afterTXBuyerBalance = await getBalance(buyer);
      const afterTXContractBalance = await getBalance(_contract.address);
      const afterTXOwnerBalance = await getBalance(currentOwner);

      const book = await _contract.getBookByHash(bookHash2);
      const expectedState = 2;
      const expectedPrice = 0;
      const gas = await getGas(result);
      assert.equal(book.state, expectedState, "Book is NOT deactivated");
      assert.equal(book.price, expectedPrice, "Book price is not 0!");
      // after book is deactivated, buyer receives the cost
      assert.equal(
        toBN(beforeTXBuyerBalance).add(toBN(value)).toString(),
        afterTXBuyerBalance,
        "Buyer balance is not correct"
      );

      assert.equal(
        toBN(beforeTXOwnerBalance).sub(gas).toString(),
        afterTXOwnerBalance,
        "contract owner balance is not correct"
      );
      // contract balance are not affected by the gas fees
      assert.equal(
        toBN(beforeTXContractBalance).sub(toBN(value)).toString(),
        afterTXContractBalance,
        "Contract balance is not correct"
      );
    });
    it("should not be able to activate the deactivated book", async () => {
      // only contract owner should be able to deactivate book
      await catchRevert(
        _contract.activateBook(bookHash2, { from: contractOwner })
      );
    });
  });

  describe("Repurchase book", () => {
    let bookHash2 = null;
    before(async () => {
      bookHash2 = await _contract.getBookHashAtIndex(1);
    });

    it("should NOT repurchase when the book doesn't exist", async () => {
      // if i didnot "0x"  i get error: AssertionError: Expected an error starting with 'Returned error: VM Exception while processing transaction: revert' but got 'invalid arrayify value (argument="value", value="3b2854a1353e3499a1f785302ab093acc8eaccdc2ea0bb33d649ae8f67c2f967", code=INVALID_ARGUMENT, version=bytes/5.0.5)' instead
      const notExistingHash =
        "0x5ceb3f8075c3dbb5d490c8d1e6c950302ed065e1a9031750ad2c6513069e3fc3";
      await catchRevert(
        _contract.repurchaseBook(notExistingHash, { from: buyer })
      );
    });
    it("should NOT repurchase with not the book owner", async () => {
      const notOwnerAddress = accounts[2];
      await catchRevert(
        _contract.repurchaseBook(bookHash2, { from: notOwnerAddress })
      );
    });
    it("should be able to repurchase with the original buyer", async () => {
      // to make sure beforeTX and afterTx balance correct we use BigNumber
      const beforeTXBuyerBalance = await getBalance(buyer);
      const beforeTXContractBalance = await getBalance(_contract.address);
      // result object has gas cost
      const result = await _contract.repurchaseBook(bookHash2, {
        from: buyer,
        value,
      });
      console.log("result", result);
      const afterTXBuyerBalance = await getBalance(buyer);
      const afterTXContractBalance = await getBalance(_contract.address);
      const gas = await getGas(result);

      const book = await _contract.getBookByHash(bookHash2);
      const expectedState = 0;
      assert.equal(
        book.state,
        expectedState,
        "The book is not in purchase state"
      );
      // after repurchase the contract, contract balance will increase
      assert.equal(
        toBN(beforeTXContractBalance).add(toBN(value)).toString(),
        afterTXContractBalance,
        "Client balance is not correct"
      );
      assert.equal(
        book.price,
        value,
        `The book price is not equal to ${value}`
      );
      assert.equal(
        // this is an object and has extra methods
        toBN(beforeTXBuyerBalance).sub(toBN(value)).sub(gas).toString(),
        afterTXBuyerBalance,
        "Client balance is not correct"
      );
    });
    it("should NOT be able to repurchase the book", async () => {
      await catchRevert(_contract.repurchaseBook(bookHash2, { from: buyer }));
    });
  });

  describe("Receive funds", () => {
    it("should have transacted funds", async () => {
      const value = "100000000000000000";
      const contractBeforeTx = await getBalance(_contract.address);
      // eth.sendTransaction is sending ether from rinkeby to contract address
      await web3.eth.sendTransaction({
        from: buyer,
        to: _contract.address,
        value,
      });

      const contractAfterTx = await getBalance(_contract.address);
      assert.equal(
        toBN(contractBeforeTx).add(toBN(value)).toString(),
        contractAfterTx,
        "value after transaction is not matching"
      );
    });
  });

  describe("Normal withdraw", () => {
    const fundToDeposit = "100000000000000000";
    // bigger than balance
    const overLimitFunds = "999900000000000000000";
    let currentOwner = null;
    before(async () => {
      currentOwner = await _contract.getContractOwner();

      await web3.eth.sendTransaction({
        from: buyer,
        to: _contract.address,
        value: fundToDeposit,
      });
    });

    it("should fail when withdrawing with NOT owner address", async () => {
      // 0.01 eth. I deposited 0.1 eth above so should be able to withdraw
      // passing number instead of string: AssertionError: Expected an error starting with 'Returned error: VM Exception while processing transaction: revert' but got 'overflow (fault="overflow", operation="BigNumber.from", value=10000000000000000, code=NUMERIC_FAULT, version=bignumber/5.0.8)'
      const value = "10000000000000000";
      await catchRevert(_contract.withdraw(value, { from: buyer }));
    });

    it("should fail when withdrawing over limit balance", async () => {
      await catchRevert(
        _contract.withdraw(overLimitFunds, { from: currentOwner })
      );
    });

    it("should have +0.1 eth after withdrawing", async () => {
      const ownerBalance = await getBalance(currentOwner);
      const result = await _contract.withdraw(fundToDeposit, {
        from: currentOwner,
      });
      const newOwnerBalance = await getBalance(currentOwner);

      const gas = await getGas(result);
      assert.equal(
        // gas is already BN
        toBN(ownerBalance).add(toBN(fundToDeposit)).sub(gas).toString(),
        newOwnerBalance,
        "The new owner Balance is not correct!"
      );
    });
  });

  describe("Emergency withdraw", () => {
    let currentOwner;
    before(async () => {
      currentOwner = await _contract.getContractOwner();
    });
    // since we are stopping the contract make sure we resume after
    after(async () => {
      await _contract.resumeContract({ from: currentOwner });
    });
    it("should failed if the contract is not stopped", async () => {
      await catchRevert(_contract.emergencyWithdraw({ from: currentOwner }));
    });
    it("should have +contract funds on conract owner", async () => {
      // we should have stopped the contract
      await _contract.stopContract({ from: contractOwner });
      const contractBalance = await getBalance(_contract.address);
      const ownerBalance = await getBalance(currentOwner);

      const result = await _contract.emergencyWithdraw({ from: currentOwner });
      const gas = await getGas(result);
      const newOwnerBalance = await getBalance(currentOwner);

      assert.equal(
        toBN(ownerBalance).add(toBN(contractBalance)).sub(gas),
        newOwnerBalance,
        "Owner does not have contract balance"
      );
    });
    it("should have 0 contract balance, because we withdraw all above test", async () => {
      const contractBalance = await getBalance(_contract.address);
      assert.equal(contractBalance, 0, "Contract does not have 0 balance");
    });
  });

  describe("Self Destruct", () => {
    let currentOwner;

    before(async () => {
      currentOwner = await _contract.getContractOwner();
    });

    it("should fail when contract is NOT stopped", async () => {
      await catchRevert(_contract.selfDestruct({ from: currentOwner }));
    });

    it("should have +contract funds on contract owner", async () => {
      await _contract.stopContract({ from: contractOwner });

      const contractBalance = await getBalance(_contract.address);
      const ownerBalance = await getBalance(currentOwner);

      const result = await _contract.selfDestruct({ from: currentOwner });
      const gas = await getGas(result);

      const newOwnerBalance = await getBalance(currentOwner);

      assert.equal(
        toBN(ownerBalance).add(toBN(contractBalance)).sub(gas),
        newOwnerBalance,
        "Owner doesn't have contract balance"
      );
    });

    it("should have contract balance of 0", async () => {
      const contractBalance = await getBalance(_contract.address);

      assert.equal(contractBalance, 0, "Contract does't have 0 balance");
    });

    it("should have 0x bytecode", async () => {
      const code = await web3.eth.getCode(_contract.address);

      assert.equal(code, "0x", "Contract is not destroyed");
    });
  });
});
