const { v5: uuidv5 } = require("uuid");

const GenerateUniqueId = (name) => {
  const currentDatetime = new Date().toISOString();
  const uniqueString = `${name}-${currentDatetime}`;
  return uuidv5(uniqueString, uuidv5.DNS);
};

module.exports = { GenerateUniqueId };
