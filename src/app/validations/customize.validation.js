const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid id format');
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 6) {
    return helpers.message("password must be at least 6 characters");
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(
      "password must contain at least 1 letter and 1 number"
    );
  }
  return value;
};

const macAddress = (value, helpers) => {
  if (!value.match(/^([0-9A-Fa-f]{2}-){5}([0-9A-Fa-f]{2})$/)) {
    return helpers.message(" mac address is not in the correct format ");
  }
  return value;
};

module.exports = {
  objectId,
  password,
  macAddress,
};
