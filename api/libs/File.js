const mongo = require("./../mongo");
const nanoid = require("nanoid");

const FILENAME_REGEX = /^[A-Za-z0-9-_]{1,}\.(?:js|css|html|json)$/;

const isValidFilename = (filename) => {
  return FILENAME_REGEX.test(filename);
};

const create = (name, content, opts = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!isValidFilename(name)) {
        return reject({
          field: "name",
          message:
            "Tên file không hợp lệ, chỉ chấp nhận: chữ cái, chữ số, _, -, phần mở rộng: js, css",
        });
      }

      const db = mongo.getDb();
      let file = {
        id: nanoid(20),
        name: name.trim(),
        content,
        ...opts,
      };
      let rs = await db.collection("wix_files").insertOne(file);
      if (rs.insertedCount === 1) {
        return resolve(file.id);
      }
      reject(null);
    } catch (e) {
      reject(e);
    }
  });
};

const update = (id, name, content = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!isValidFilename(name)) {
        return reject({
          field: "name",
          message: "Tên file không hợp lệ, chỉ chấp nhận chữ cái, chữ số, _, -",
        });
      }
      const db = mongo.getDb();
      let file = {
        name: name.trim(),
      };
      if (content != null) {
        file.content = content;
      }
      let rs = await db
        .collection("wix_files")
        .updateOne({ id }, { $set: file });
      if (rs.modifiedCount === 1 || rs.matchedCount === 1) {
        return resolve(file.id);
      }
      reject(null);
    } catch (e) {
      reject(e);
    }
  });
};

const remove = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = mongo.getDb();
      await db.collection("wix_files").deleteOne({ id });
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

const read = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = mongo.getDb();
      let file = await db.collection("wix_files").findOne({ id });
      if (file) {
        resolve(file);
      } else {
        reject(null);
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  read,
  create,
  update,
  remove,
};
