export const BOOK_STATES = {
  0: "purchased",
  1: "activated",
  2: "deactivated",
};

export const normalizeOwnedBook = (web3) => (book, ownedBook) => {
  return {
    ...book,
    ownedBookId: ownedBook.id,
    proof: ownedBook.proof,
    owned: ownedBook.owner,
    price: web3.utils.fromWei(ownedBook.price),
    state: BOOK_STATES[ownedBook.state],
  };
};
