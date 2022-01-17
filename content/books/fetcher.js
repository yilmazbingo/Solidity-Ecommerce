import books from "./books.json";

export const getAllBooks = () => {
  return {
    data: books,
    bookMap: books.reduce((a, c, i) => {
      a[c.id] = c;
      a[c.id].index = i;
      return a;
    }, {}),
  };
};
