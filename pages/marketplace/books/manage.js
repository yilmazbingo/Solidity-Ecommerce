import { useAdmin, useManagedBooks } from "@components/hooks/web3";
import { useWeb3 } from "@components/providers";
import { Button, Message } from "@components/ui/common";
import { BookFilter, ManagedBookCard } from "@components/ui/book";
import { BaseLayout } from "@components/ui/layout";
import { MarketHeader } from "@components/ui/marketplace";
import { normalizeOwnedBook } from "@utils/normalize";
import { useState } from "react";
import { withToast } from "@utils/toast";

const VerificationInput = ({ onVerify }) => {
  const [email, setEmail] = useState("");
  return (
    <div className="flex mr-2 relative rounded-md">
      <input
        value={email}
        onChange={({ target: { value } }) => setEmail(value)}
        type="text"
        name="account"
        id="account"
        className="w-96 focus:ring-indigo-500 shadow-md focus:border-indigo-500 block pl-7 p-4 sm:text-sm border-gray-300 rounded-md"
        placeholder="0x2341ab..."
      />
      <Button
        onClick={() => {
          onVerify(email);
        }}
      >
        Verify
      </Button>
    </div>
  );
};

export default function ManagedBooks() {
  const [proofedOwnership, setProofedOwnership] = useState({});
  const [searchedBook, setSearchedBook] = useState(null);
  const [filters, setFilters] = useState({ state: "all" });
  const { web3, contract } = useWeb3();
  const { account } = useAdmin({ redirectTo: "/marketplace" });
  const { managedBooks } = useManagedBooks(account);

  const verifyBook = (email, { hash, proof }) => {
    if (!email) {
      return;
    }
    const emailHash = web3.utils.sha3(email);
    const proofToCheck = web3.utils.soliditySha3(
      { type: "bytes32", value: emailHash },
      { type: "bytes32", value: hash }
    );

    proofToCheck === proof
      ? setProofedOwnership({
          ...proofedOwnership,
          [hash]: true,
        })
      : setProofedOwnership({
          ...proofedOwnership,
          [hash]: false,
        });
  };

  const changeBookState = async (bookHash, method) => {
    try {
      // since we want to dynamically call the method, we do not use . notation. we use []
      const result = await contract.methods[method](bookHash).send({
        from: account.data,
      });
      return result;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const activateBook = async (bookHash) => {
    withToast(changeBookState(bookHash, "activateBook"));
  };

  const deactivateBook = async (bookHash) => {
    withToast(changeBookState(bookHash, "deactivateBook"));
  };

  const searchBook = async (hash) => {
    const re = /[0-9A-Fa-f]{6}/g;

    if (hash && hash.length === 66 && re.test(hash)) {
      const book = await contract.methods.getBookByHash(hash).call();
      // 40 0's represents empty address

      if (book.owner !== "0x0000000000000000000000000000000000000000") {
        const normalized = normalizeOwnedBook(web3)({ hash }, book);
        setSearchedBook(normalized);
        return;
      }
    }

    setSearchedBook(null);
  };

  const renderCard = (book, isSearched) => {
    return (
      <ManagedBookCard
        key={book.ownedBookId}
        isSearched={isSearched}
        book={book}
      >
        <VerificationInput
          onVerify={(email) => {
            verifyBook(email, {
              hash: book.hash,
              proof: book.proof,
            });
          }}
        />
        {proofedOwnership[book.hash] && (
          <div className="mt-2">
            <Message>Verified!</Message>
          </div>
        )}
        {proofedOwnership[book.hash] === false && (
          <div className="mt-2">
            <Message type="danger">Wrong Proof!</Message>
          </div>
        )}
        {book.state === "purchased" && (
          <div className="mt-2">
            <Button onClick={() => activateBook(book.hash)} variant="green">
              Activate
            </Button>
            <Button onClick={() => deactivateBook(book.hash)} variant="red">
              Deactivate
            </Button>
          </div>
        )}
      </ManagedBookCard>
    );
  };

  if (!account.isAdmin) {
    return null;
  }

  const filteredBooks = managedBooks.data
    ?.filter((book) => {
      if (filters.state === "all") {
        return true;
      }

      return book.state === filters.state;
    })
    .map((book) => renderCard(book));

  return (
    <>
      <MarketHeader />
      <BookFilter
        onFilterSelect={(value) => setFilters({ state: value })}
        onSearchSubmit={searchBook}
      />
      <section className="grid grid-cols-1">
        {searchedBook && (
          <div>
            <h1 className="text-2xl font-bold  p-5">Search</h1>
            {renderCard(searchedBook, true)}
          </div>
        )}
        <h1 className="text-2xl font-bold p-5">All Books</h1>
        {filteredBooks}
        {filteredBooks?.length === 0 && (
          <Message type="warning">No books to display</Message>
        )}
      </section>
    </>
  );
}

ManagedBooks.Layout = BaseLayout;
