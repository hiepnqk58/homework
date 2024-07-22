const mongoose = require("mongoose");

const autoIncrementPlugin = (schema, options) => {
  schema.add({ [options.field]: Number });

  schema.pre("save", async function (next) {
    if (!this.isNew) return next();

    const model = this.constructor;
    try {
      const lastDoc = await model
        .findOne()
        .sort({ [options.field]: -1 })
        .exec();
      this[options.field] = lastDoc ? lastDoc[options.field] + 1 : 1;
      next();
    } catch (err) {
      next(err);
    }
  });
};

module.exports = autoIncrementPlugin;
