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

  mapping(bytes32 => Book) private ownedBooks;

  // mapping of bookID to bookHash
  mapping(uint => bytes32) private ownedBookHash;

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

// We might need to fund the conract. receive is a reserved word
   receive() external payable{

   }

   // this will transfer amount to the owner
   function withdraw(uint amount) external onlyOwner{
     (bool success,)=owner.call{value:amount}("");
     require(success,"Transfer failed!");

   }
  // incase contract is attacked, withdraw everything
   function emergencyWithdraw() external onlyWhenStopped onlyOwner {
     (bool success,)=owner.call{value:address(this).balance}("");
     require(success,"Transfer failed!");
   }

   function selfDestruct() external onlyWhenStopped onlyOwner{
     // this will destruct the contract and transfer the remaining balance to the owner
     // selfdestruct() effectively removes the deployed bytecode from the contract address.
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
    // since we use storage, we can manipulate the data
    Book storage book=ownedBooks[bookHash];
    if (book.state!=State.Purchased){
      revert InvalidState();
    }
    book.state=State.Activated;
  }
  
  // keccak hash is 32 bytes
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
    // at this point, we are sure the we are the owner
    Book storage book=ownedBooks[bookHash];
    // we can repurchase only if the current state is deactivated
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
    // transfer ether back to the owner
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
