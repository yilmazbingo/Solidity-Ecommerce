import { useAccount, useOwnedBook } from "@components/hooks/web3";
import { useWeb3 } from "@components/providers";
import { Message, Modal } from "@components/ui/common";
import { BookHero, Curriculum, Keypoints } from "@components/ui/book";
import { BaseLayout } from "@components/ui/layout";
import { getAllBooks } from "@content/books/fetcher";

export default function Book({ book }) {
  const { isLoading } = useWeb3();
  const { account } = useAccount();
  const { ownedBook } = useOwnedBook(book, account.data);
  const bookState = ownedBook.data?.state;
  // const bookState = "deactivated"
  const isLocked =
    !bookState || bookState === "purchased" || bookState === "deactivated";

  return (
    <>
      <div className="py-4">
        <BookHero
          hasOwner={!!ownedBook.data}
          title={book.title}
          description={book.description}
          image={book.coverImage}
        />
      </div>
      <Keypoints points={book.wsl} />
      {bookState && (
        <div className="max-w-5xl mx-auto">
          {bookState === "purchased" && (
            <Message type="warning">
              Book is purchased and waiting for the activation. Process can take
              up to 24 hours.
              <i className="block font-normal">
                In case of any questions, please contact info@bookstore.com
              </i>
            </Message>
          )}
          {bookState === "activated" && (
            <Message type="success">
              Bookstore team wishes you happy watching of the book.
            </Message>
          )}
          {bookState === "deactivated" && (
            <Message type="danger">
              Book has been deactivated, due the incorrect purchase data. The
              functionality to watch the book has been temporaly disabled.
              <i className="block font-normal">
                Please contact info@bookstore.com
              </i>
            </Message>
          )}
        </div>
      )}
      <Curriculum
        isLoading={isLoading}
        locked={isLocked}
        bookState={bookState}
      />
      {/* <Modal /> */}
    </>
  );
}

//getStaticPaths is required for dynamic SSG pages and is missing for

export function getStaticPaths() {
  const { data } = getAllBooks();

  return {
    paths: data.map((c) => ({
      params: {
        slug: c.slug,
      },
    })),
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  const { data } = getAllBooks();
  const book = data.filter((c) => c.slug === params.slug)[0];

  return {
    props: {
      book,
    },
  };
}

Book.Layout = BaseLayout;
