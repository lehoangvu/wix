var express = require("express");
var config = require("config");
var validator = require("validator");
var router = express.Router();
var mongo = require("./../../mongo");
var nanoid = require("nanoid");
var File = require("./../../libs/File");
const LIMIT = 10;

const DEFAULT_TYPE = 'page'
const WIDGET_TYPE = 'widget'

const DEFAULT_FILES = {
  page: [
    {
      name: "index.html",
      content: `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Document</title>
  </head>
  <body>
    
  </body>
  </html>`,
      removeable: false
    },
    {
      name: "setting.json",
      content: `
        {
          
        }
      `,
      removeable: false
    },
    {
      name: "index.js",
      content: "/*Write js code here...*/"
    },
    {
      name: "index.css",
      content: "/*Write css code here...*/"
    }
  ],
  widget: [
    {
      name: "index.html",
      content: `<!--Write html code here...-->`,
      removeable: false
    },
    {
      name: "index.js",
      content: "/*Write js code here...*/"
    },
    {
      name: "index.css",
      content: "/*Write css code here...*/"
    }
  ]

}

const createDefaultFile = async (page_id, user_id, type = DEFAULT_TYPE) => {
  const db = mongo.getDb();

  return new Promise(async (resolve, reject) => {
    try {
      for (var i = 0; i < DEFAULT_FILES[type].length; i++) {
        const { name, content, removeable } = DEFAULT_FILES[type][i];
        let fileId = await File.create(name, content, { removeable });
        await db.collection("wix_file_pages").insertOne({
          id: nanoid(6),
          name,
          page_id,
          user_id,
          file_id: fileId
        });
      }
      resolve(true);
    } catch (e) {
      console.log(e);
      resolve(false);
    }
  });
};

router.post("/", async function(req, res) {
  const db = mongo.getDb();
  let { pageId, path, title, html } = req.body;

  let errors = [];
  let status = 400;

  path = path ? "/" + path : "";
  // remove duplicate slash
  while (path.indexOf("//") !== -1) {
    path = path.replace("//", "/");
  }

  if (
    !path ||
    !validator.isURL(path, {
      require_host: false,
      require_host: false,
      require_valid_protocol: false
    })
  ) {
    status = 400;
    errors.push({ field: "path", message: "Path không hợp lệ" });
  }

  if (!siteId) {
    status = 400;
    errors.push({ field: "site", message: "Không tìm thấy site" });
  }

  if (!pageId) {
    status = 400;
    errors.push({ field: "id", message: "Không tìm thấy page" });
  }

  if (!title || validator.isEmpty(title)) {
    status = 400;
    errors.push({ field: "title", message: "Tiêu đề không được trống" });
  }

  if (errors.length == 0) {
    let qr = await db.collection("wix_pages").findOne({
      path,
      user_id: req.auth.user_id
    });
    if (qr) {
      status = 400;
      errors.push({ field: "path", message: "Path đã được sử dụng" });
    }
  }

  if (errors.length == 0) {
    // update page
    let page = {
      title,
      html,
      path,
      updatedAt: new Date().getTime()
    };
    let rs = await db.collection("wix_pages").updateOne(
      {
        id: pageId
      },
      {
        $set: page
      }
    );
    if (rs.modifiedCount == 1 || rs.matchedCount == 1) {
      return res.send({
        success: true
      });
    }
    if (errors.length === 0) {
      // has error when insert
      status = 400;
      errors.push("Không tìm thấy page!");
      res.status(status).json({ errors });
    }
  } else {
    res.status(status).json({ errors });
  }
});

router.put("/", async function(req, res) {
  const db = mongo.getDb();
  let { path, title, siteId, type = DEFAULT_TYPE } = req.body;

  let errors = [];
  let status = 400;

  path = path ? "/" + path : "";
  // remove duplicate slash
  while (path.indexOf("//") !== -1) {
    path = path.replace("//", "/");
  }

  if (
    !path ||
    !validator.isURL(path, {
      require_host: false,
      require_host: false,
      require_valid_protocol: false
    })
  ) {
    status = 400;
    errors.push({ field: "path", message: "Path không hợp lệ" });
  }

  if (!siteId) {
    status = 400;
    errors.push({ field: "site", message: "Không tìm thấy site" });
  }

  if (siteId) {
    let qrs = await db.collection("wix_sites").findOne({
      id: siteId,
      user_id: req.auth.user_id
    });
    if (!qrs) {
      status = 400;
      errors.push({ field: "site", message: "Không tìm thấy site" });
    }
  }

  if (!title || validator.isEmpty(title)) {
    status = 400;
    errors.push({ field: "title", message: "Tiêu đề không được trống" });
  }

  if (errors.length == 0) {
    let qr = await db.collection("wix_pages").findOne({
      path,
      site_id: siteId,
      user_id: req.auth.user_id
    });
    if (qr) {
      status = 400;
      errors.push({ field: "path", message: "Path đã được sử dụng" });
    }
  }

  if (errors.length == 0) {
    let pageId = nanoid(10);
    // create default files
    let settupFileSuccess = await createDefaultFile(pageId, req.auth.user_id, type);

    // add page
    let page = {
      title,
      path,
      id: pageId,
      html: "",
      site_id: siteId,
      type,
      user_id: req.auth.user_id,
      error_file_default: !settupFileSuccess,
      createdAt: new Date().getTime()
    };
    let rs = await db.collection("wix_pages").insertOne(page);
    if (rs.insertedCount == 1) {
      return res.send({
        success: true
      });
    }
    if (errors.length === 0) {
      // has error when insert
      status = 400;
      errors.push("Có lỗi xảy ra!");
    }

    res.status(status).json({ errors });
  } else {
    res.status(status).json({ errors });
  }
});
router.get("/", async function(req, res) {
  const limit = req.query.limit ? parseInt(req.query.limit) : LIMIT;
  const page = req.query.page ? parseInt(req.query.page) : 1;

  let { siteId } = req.query;
  if (!siteId) {
    res.status(500).json("Không tìm thấy site");
  }

  let qrs = await mongo
    .getDb()
    .collection("wix_pages")
    .find({
      user_id: req.auth.user_id,
      site_id: siteId
    })
    .sort({ _id: -1 })
    .limit(limit || LIMIT)
    .skip(((page || 1) - 1) * limit);

  let data = (await qrs.toArray()).map(item => {
    return {
      id: item.id,
      path: item.path,
      title: item.title,
      createdAt: item.createdAt
    };
  });

  let totalResult = await mongo
    .getDb()
    .collection("wix_pages")
    .countDocuments({
      user_id: req.auth.user_id,
      site_id: siteId
    });

  let results = {
    data,
    total: totalResult
  };

  res.send(results);
});
router.get("/:pageId", async function(req, res) {
  let { siteId } = req.query;
  let { pageId } = req.params;
  if (!siteId) {
    res.status(500).json("Không tìm thấy site");
  }

  let page = await mongo
    .getDb()
    .collection("wix_pages")
    .findOne({
      user_id: req.auth.user_id,
      site_id: siteId,
      id: pageId
    });
  if (page) {
    let fileQr = await mongo
      .getDb()
      .collection("wix_file_pages")
      .find({
        page_id: pageId
      })
      .sort({ _id: -1 });
    let files = await fileQr.toArray();
    page.files = [];
    page.files = files.map(file => ({
      id: file.file_id,
      name: file.name
    }));

    // remove stuff
    delete page._id;
    // delete page.site_id;
    delete page.user_id;

    return res.json(page);
  } else {
    return res.status(400).json({
      errors: ["Không tìm thấy trang"]
    });
  }
});
router.get("/:pageId/release", async function(req, res) {
  let releaseVersion = (new Date()).getTime()
  let { siteId, isPreview } = req.query;
  let { pageId } = req.params;
  let db = mongo.getDb()
  if (!siteId) {
    res.status(500).json("Không tìm thấy site");
  }

  let site = await db.collection('wix_sites').findOne({
    id: siteId,
    user_id: req.auth.user_id
  })

  let page = await db.collection('wix_pages').findOne({
    site_id: siteId,
    id: pageId,
    user_id: req.auth.user_id
  })

  if(!page) {
    res.status(500).json("Không tìm thấy page");
  }

  let files = await (await db.collection("wix_file_pages").aggregate([
    {
      $lookup: {
        from: "wix_files",
        localField: "file_id",
        foreignField: "id",
        as: "file"
      }
    },
    {
      $match: {
        page_id: page.id,
        user_id: req.auth.user_id
      }
    }
  ])).toArray();

  let releaseFiles = []

  for(let i = 0; i < files.length; i++) {
    let {content, name} = files[i].file[0];
    // combine html
    // replace PUBLIC_URL by cdn link
    // format: ${cdn}/:siteId/:pageId/:releaseVersion
    while(content.indexOf('{{PUBLIC_URL}}') != -1) {
      content = content.replace('{{PUBLIC_URL}}', `${config.get('cdn')}/${siteId}/${pageId}/${releaseVersion}`)
    }
    files[i].file[0].content = content;
    releaseFiles.push({
      user_id: req.auth.user_id,
      site_id: siteId,
      page_id: pageId,
      version: releaseVersion,
      content,
      name,
      path: page.path,
      domain: site.domain,
      preview: isPreview == "1"
    })
  }


  // save content to release

  await db.collection('wix_release').insertMany(releaseFiles)

  return res.json({success: true});

  return res.status(400).json({
    errors: ["Không tìm thấy trang"]
  });
});

module.exports = router;
