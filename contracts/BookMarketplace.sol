// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./ErrorMessages.sol";

contract BookMarketplace is ErrorMessages{

  enum State {
    Purchased,
    Activated,
    Deactivated
  }

  struct Book {
    uint id; // 32
    uint price; // 32
    bytes32 proof; // 32 keccak is 32 bytes hash
    address owner; // 20
    State state; // 1
  }

  bool public isStopped=false; 
 // mapping of bookHash to Book data. When i fetch the data, I get the bookHash first from ownedBookHash then get the book by hash
  mapping(bytes32 => Book) private ownedBooks;

  // mapping of bookID to bookHash
  mapping(uint => bytes32) private ownedBookHash;

  // this is used when fetching books in for-loop
  uint private totalOwnedBooks;
  address payable private owner;

  constructor() {
    setContractOwner(msg.sender);
  }
  
  modifier onlyOwner() {
    if (msg.sender != getContractOwner()) {
      revert OnlyOwner();
    }
    _;
  }

  modifier onlyWhenNotStopped{
    require(!isStopped);
    _;
  }

  modifier onlyWhenStopped{
    require(isStopped);
    _;
  }

  //It is required to be implemented within a contract if the contract is intended to receive ether;
   receive() external payable{

   }

   function withdraw(uint amount) external onlyOwner{
     (bool success,)=owner.call{value:amount}("");
     require(success,"Transfer failed!");

   }
   function emergencyWithdraw() external onlyWhenStopped onlyOwner {
     (bool success,)=owner.call{value:address(this).balance}("");
     require(success,"Transfer failed!");
   }

   function selfDestruct() external onlyWhenStopped onlyOwner{
     // selfdestruct() effectively removes the deployed bytecode from the contract address.
    // This is an address recipient that destroys the current contract, sending its funds to the given address
    // once this is called you cannot interact with the smart contract anymore. the address of smart contract will contain no more code
    // In the next block, this (former contract) address will act as a regular address without a smart contract, so it is able to receive tokens and ETH.
     selfdestruct(owner);
   }

  function stopContract() external onlyOwner{
       isStopped=true;

  }

  function resumeContract() external onlyOwner{
    isStopped=false;
  }

  function purchaseBook(
    bytes16 bookId, // 0x00000000000000000000000000003130
    bytes32 proof // 0x0000000000000000000000000000313000000000000000000000000000003130
  )
    external
    payable
    onlyWhenNotStopped
  {
    bytes32 bookHash = keccak256(abi.encodePacked(bookId, msg.sender));

    if (hasBookOwnership(bookHash)) {
      revert BookHasOwner();
    }

    uint id = totalOwnedBooks++;

    ownedBookHash[id] = bookHash;
    ownedBooks[bookHash] = Book({
      id: id,
      price: msg.value,
      proof: proof,
      owner: msg.sender,
      state: State.Purchased
    });
  }

  function activateBook(bytes32 bookHash)
    external 
    onlyWhenNotStopped
    onlyOwner

  {
    if(!isBookCreated(bookHash)){
      revert BookIsNotCreated();
    }
    // with using storage, we can manipulate the data
    Book storage book=ownedBooks[bookHash];
    if (book.state!=State.Purchased){
      revert InvalidState();
    }
    book.state=State.Activated;
  }
  
  function repurchaseBook(bytes32 bookHash)
  external 
  payable
  onlyWhenNotStopped

  {
     if(!isBookCreated(bookHash)){
      revert BookIsNotCreated();
    }
    if(!hasBookOwnership(bookHash)){
      revert SenderIsNotBookOwner();
    }
    Book storage book=ownedBooks[bookHash];
    // repurchase only if the current state is deactivated
    if(book.state!=State.Deactivated){
      revert InvalidState();
    }
    book.state=State.Purchased;
    book.price=msg.value;
  
  }

  function deactivateBook(bytes32 bookHash)
    external 
    onlyWhenNotStopped
    onlyOwner
  {
    if(!isBookCreated(bookHash)){
      revert BookIsNotCreated();
    }
    // since we use storage, we can manipulate the data
    Book storage book=ownedBooks[bookHash];
    if (book.state!=State.Purchased){
      revert InvalidState();
    }
    (bool success, )=book.owner.call{value:book.price}("");
    require(success, "Transfer failed");

    book.state=State.Deactivated;
    book.price=0;
  }



  function transferOwnership(address newOwner)
    external
    onlyOwner
  {
    setContractOwner(newOwner);
  }
   
  function getBookCount()
    external
    view
    returns (uint)
  {
    return totalOwnedBooks;
  }

  function getBookHashAtIndex(uint index)
    external
    view
    returns (bytes32)
  {
    return ownedBookHash[index];
  }

  function getBookByHash(bytes32 bookHash)
    external
    view
    returns (Book memory)
  {
    return ownedBooks[bookHash];
  }

  function getContractOwner()
    public
    view
    returns (address)
  {
    return owner;
  }

  function setContractOwner(address newOwner) private {
    owner = payable(newOwner);
  }

  function isBookCreated(bytes32 bookHash)
  private
  view
  returns (bool)
  {
    return ownedBooks[bookHash].owner !=0x0000000000000000000000000000000000000000;
  }

  function hasBookOwnership(bytes32 bookHash)
    private
    view
    returns (bool)
  {
    return ownedBooks[bookHash].owner == msg.sender;
  }
}
