import { createBookHash } from "@utils/hash";
import { normalizeOwnedBook } from "@utils/normalize";
import useSWR from "swr";

export const handler = (web3, contract) => (book, account) => {
  const swrRes = useSWR(
    () => (web3 && contract && account ? `web3/ownedBook/${account}` : null),
    async () => {
      const bookHash = createBookHash(web3)(book.id, account);

      const ownedBook = await contract.methods.getBookByHash(bookHash).call();

      if (ownedBook.owner === "0x0000000000000000000000000000000000000000") {
        return null;
      }

      return normalizeOwnedBook(web3)(book, ownedBook);
    }
  );
  console.log("swrRes in own book hook", swrRes);
  return swrRes;
};
