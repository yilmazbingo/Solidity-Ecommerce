// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract ErrorMessages{
  /// Book has invalid state!
  error InvalidState();
  /// Book is not created
  error BookIsNotCreated();
  /// Book has already a Owner!
  error BookHasOwner();
  /// Only owner has an access!
  error OnlyOwner();
  /// Sender is not book owner!
  error SenderIsNotBookOwner();

}