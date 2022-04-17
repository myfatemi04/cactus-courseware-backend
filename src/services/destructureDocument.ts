const destructureDocument = (doc: any) => {
  const {_id, __v, ...obj} = doc._doc;
  return obj;
}

export default destructureDocument;