import { normalizeOwnedBook } from "@utils/normalize";
import useSWR from "swr";

export const handler = (web3, contract) => (account) => {
  const swrRes = useSWR(
    () =>
      web3 && contract && account.data && account.isAdmin
        ? `web3/managedBooks/${account.data}`
        : null,
    async () => {
      const books = [];
      // bookCount would be a string
      const bookCount = await contract.methods.getBookCount().call();
      //   I always get the newest book at the beginning of the array
      for (let i = Number(bookCount) - 1; i >= 0; i--) {
        const bookHash = await contract.methods.getBookHashAtIndex(i).call();
        // return ownedBooks[bookHash];
        const book = await contract.methods.getBookByHash(bookHash).call();
        if (book) {
          //   first arg is book. admin does not need to know what book user has purchased
          books.push(normalizeOwnedBook(web3)({ hash: bookHash }, book));
        }
      }

      return books;
    }
  );

  return swrRes;
};
