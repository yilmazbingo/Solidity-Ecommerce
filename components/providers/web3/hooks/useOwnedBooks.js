import { createBookHash } from "@utils/hash";
import { normalizeOwnedBook } from "@utils/normalize";
import useSWR from "swr";

export const handler = (web3, contract) => (books, account) => {
  const swrResponse = useSWR(
    //   since identifier is unique "web3/ownedBooks", it does not refetch when I switch the account
    // adding account makes sure identifier is changing
    () => (web3 && contract && account ? `web3/ownedBooks/${account}` : null),
    async () => {
      const ownedBooks = [];

      for (let i = 0; i < books.length; i++) {
        const book = books[i];
        if (!book.id) {
          continue;
        }
        const bookHash = createBookHash(web3)(book.id, account);
        console.log("bookHash", bookHash);
        let ownedBook;
        // if you make transaction, use send
        try {
          ownedBook = await contract.methods.getBookByHash(bookHash).call();
          console.log("owned book", ownedBook);
        } catch (e) {
          console.log("error in useOwned Hook calling method", e);
        }
        if (ownedBook.owner !== "0x0000000000000000000000000000000000000000") {
          const normalized = normalizeOwnedBook(web3)(book, ownedBook);
          ownedBooks.push(normalized);
        }
      }
      console.log("owned Books", ownedBooks);
      return ownedBooks;
    }
  );

  return {
    ...swrResponse,
    lookup:
      swrResponse.data?.reduce((accu, book) => {
        accu[book.id] = book;
        return accu;
      }, {}) ?? {},
  };
};
