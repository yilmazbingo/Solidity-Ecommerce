export default function List({ books, children }) {
  return (
    <section className="grid md:grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
      {/* this is called render prop */}
      {books.map((book) => children(book))}
    </section>
  );
}
