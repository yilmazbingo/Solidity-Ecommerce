import { Hero } from "@components/ui/common";
import { BookList, BookCard } from "@components/ui/book";
import { BaseLayout } from "@components/ui/layout";
import { getAllBooks } from "@content/books/fetcher";

export default function Home({ books }) {
  return (
    <>
      <Hero />
      <BookList books={books}>
        {(book) => <BookCard key={book.id} book={book} />}
      </BookList>
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

Home.Layout = BaseLayout;
