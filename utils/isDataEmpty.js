export const _isEmpty = (data) => {
  return (
    // this way we can also check for undefined values. null==undefined = true
    data == null ||
    data == "" ||
    (Array.isArray(data) && data.length === 0) ||
    // we want {} to be false. we cannot use !! because !!{} turns to be true
    // !!{}=true and !!{name:"yilmaz"}=true. !! does not work ofr objects
    (data.constructor === Object && Object.keys(data).length === 0)
  );
};
