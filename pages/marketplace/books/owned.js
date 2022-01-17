import { useAccount, useOwnedBooks } from "@components/hooks/web3";
import { Button, Message } from "@components/ui/common";
import { OwnedBookCard } from "@components/ui/book";
import { BaseLayout } from "@components/ui/layout";
import { MarketHeader } from "@components/ui/marketplace";
import { getAllBooks } from "@content/books/fetcher";
import { useRouter } from "next/router";
import { useWeb3 } from "@components/providers";
import Link from "next/link";

export default function OwnedBooks({ books }) {
  const router = useRouter();
  const { requireInstall } = useWeb3();
  const { account } = useAccount();
  const { ownedBooks } = useOwnedBooks(books, account.data);

  return (
    <>
      <MarketHeader />
      <section className="grid grid-cols-1">
        {ownedBooks.isEmpty && (
          <div className="w-1/2">
            <Message type="warning">
              <div>You don&apos;t own any books</div>
              <Link href="/marketplace">
                <a className="font-normal hover:underline">
                  <i>Purchase Books</i>
                </a>
              </Link>
            </Message>
          </div>
        )}
        {account.isEmpty && (
          <div className="w-1/2">
            <Message type="warning">
              <div>Please connect to Metamask</div>
            </Message>
          </div>
        )}

        {requireInstall && (
          <div className="w-1/2">
            <Message type="warning">
              <div>Please install Metamask</div>
            </Message>
          </div>
        )}
        {ownedBooks.data?.map((book) => (
          <OwnedBookCard key={book.id} book={book}>
            <Button onClick={() => router.push(`/books/${book.slug}`)}>
              Read the book
            </Button>
          </OwnedBookCard>
        ))}
      </section>
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

OwnedBooks.Layout = BaseLayout;
