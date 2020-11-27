const create = async (model, data) => {
    try {
      const doc = await model.create(data);
      return doc;
    } catch (e) {
      // console.error(e);
      console.log('could not create document');
    }
  };
  const findOrCreate = async (model, data) => {
    try {
      const doc = await model
        .findOne(data)
        .lean()
        .exec();
  
      if (!doc) {
        return create(model, data);
      }
      return doc;
    } catch (e) {
      // console.error(e);
      console.log('could not find document');
    }
  };
  
  module.exports = {
    create: (model, data) => create(model, data),
    findOrCreate: (model, data) => findOrCreate(model, data)
  };
  