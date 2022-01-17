import { useState } from "react";
import { BookCard, BookList } from "@components/ui/book";
import { BaseLayout } from "@components/ui/layout";
import { getAllBooks } from "@content/books/fetcher";
import { useOwnedBooks, useWalletInfo } from "@components/hooks/web3";
import { Button } from "@components/ui/common";
import { OrderModal } from "@components/ui/order";
import { MarketHeader } from "@components/ui/marketplace";
import { Loader } from "@components/ui/common";
import { useWeb3 } from "@components/providers";
import { withToast } from "@utils/toast";
import { useEthPrice } from "@components/hooks/useEthPrice";

export default function Marketplace({ books }) {
  const { web3, contract, requireInstall } = useWeb3();
  const { hasConnectedWallet, account, isConnecting } = useWalletInfo();
  const [selectedBook, setSelectedBook] = useState(null);
  const [isNewPurchase, setIsNewPurchase] = useState(true);
  const { ownedBooks } = useOwnedBooks(books, account.data);
  console.log("owned Books", ownedBooks);
  const [busyBookId, setBusyBookId] = useState(null);
  const { eth } = useEthPrice();

  const purchaseBook = async (order, book) => {
    const hexBookId = web3.utils.utf8ToHex(book.id);
    const orderHash = web3.utils.soliditySha3(
      { type: "bytes16", value: hexBookId },
      { type: "address", value: account.data }
    );

    const value = web3.utils.toWei(String(order.price));
    setBusyBookId(book.id);

    if (isNewPurchase) {
      const emailHash = web3.utils.sha3(order.email);
      const proof = web3.utils.soliditySha3(
        { type: "bytes32", value: emailHash },
        { type: "bytes32", value: orderHash }
      );
      withToast(_purchaseBook({ hexBookId, proof, value }, book));
    } else {
      withToast(_repurchaseBook({ bookHash: orderHash, value }, book));
    }
  };

  const _purchaseBook = async ({ hexBookId, proof, value }, book) => {
    try {
      const result = await contract.methods
        .purchaseBook(hexBookId, proof)
        .send({ from: account.data, value });
      // we are refetcing the ownedBooks state. if we did not pass any data we would be waiting for the response
      // but now

      ownedBooks.mutate([
        ...ownedBooks.data,
        { ...book, state: "purchased", owner: account.data, price: value },
      ]);
      return result;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setBusyBookId(null);
    }
  };

  const _repurchaseBook = async ({ bookHash, value }, book) => {
    try {
      const result = await contract.methods
        .repurchaseBook(bookHash)
        .send({ from: account.data, value });
      ownedBooks.mutate();
      return result;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setBusyBookId(null);
    }
  };

  const cleanupModal = () => {
    setSelectedBook(null);
    setIsNewPurchase(true);
  };
  return (
    <>
      <MarketHeader />
      <BookList books={books}>
        {(book) => {
          //  -------- this is not effiecient. inside loop we have another loop. so we create look-up table
          // const owned=ownedBooks.data.find(c=>c.id==book.id)
          const owned = ownedBooks.lookup[book.id];
          // console.log("book", book);
          return (
            <BookCard
              key={book.id}
              book={book}
              state={owned?.state}
              disabled={!hasConnectedWallet}
              Footer={() => {
                if (requireInstall) {
                  return (
                    <Button size="sm" disabled={true} variant="lightPurple">
                      Install
                    </Button>
                  );
                }

                if (isConnecting) {
                  return (
                    <Button size="sm" disabled={true} variant="lightPurple">
                      <Loader size="sm" />
                    </Button>
                  );
                }
                // this should be under isConnecting
                if (!ownedBooks.hasInitialResponse) {
                  return (
                    <Button variant="white" size="sm" disabled>
                      {hasConnectedWallet ? "Loading State..." : "Connect"}
                    </Button>
                  );
                }
                const isBusy = busyBookId === book.id;
                if (owned) {
                  return (
                    <>
                      <div className="flex">
                        <Button
                          onClick={() => alert("you are owner of this book")}
                          size="sm"
                          variant="green"
                        >
                          Yours &#10003;
                        </Button>
                        {owned.state === "deactivated" && (
                          <div className="ml-1">
                            <Button
                              size="sm"
                              variant="purple"
                              onClick={() => {
                                setIsNewPurchase(false);
                                setSelectedBook(book);
                              }}
                            >
                              Fund to Activate
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  );
                }

                return (
                  <Button
                    size="sm"
                    onClick={() => setSelectedBook(book)}
                    disabled={!hasConnectedWallet || !eth.data}
                    variant="lightPurple"
                  >
                    {isBusy ? (
                      <div className="flex">
                        <Loader size="sm" />
                        <div className="ml-2"> In Progress</div>
                      </div>
                    ) : (
                      <div>Purchase</div>
                    )}
                  </Button>
                );
              }}
            />
          );
        }}
      </BookList>
      {selectedBook && (
        <OrderModal
          book={selectedBook}
          isNewPurchase={isNewPurchase}
          onSubmit={(formData, book) => {
            purchaseBook(formData, book);
            cleanupModal();
          }}
          onClose={cleanupModal}
        />
      )}
    </>
  );
}

export function getStaticProps() {
  const { data } = getAllBooks();
  return {
    props: {
      books: data,
    },
  };
}
Marketplace.Layout = BaseLayout;
