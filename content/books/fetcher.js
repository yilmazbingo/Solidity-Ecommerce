import books from "./books.json";

export const getAllBooks = () => {
  return {
    data: books,
    // a=accoumulator, c=course (data itelf), i=index
    bookMap: books.reduce((a, c, i) => {
      // since we passed {} as initial data, initially a={}
      // {courseID1:i,courseID2:i}
      a[c.id] = c;
      a[c.id].index = i;
      return a;
      // we are passing initial data structure
    }, {}),
  };
};
