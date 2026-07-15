/// <reference path="../pb_data/types.d.ts" />
// Product thumbs were "400x400"/"800x800", which crop to a square — a ski shot
// upright lost both ends. The "f" suffix fits inside the box instead, keeping
// the original ratio. Sizes not in this list silently fall back to the full file.
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("vunx0l4i08160sk")

  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tbuvw0jk",
    "name": "images",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif"
      ],
      "thumbs": [
        "400x400f",
        "1200x1200f"
      ],
      "maxSelect": 10,
      "maxSize": 5242880,
      "protected": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("vunx0l4i08160sk")

  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tbuvw0jk",
    "name": "images",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif"
      ],
      "thumbs": [
        "400x400",
        "800x800"
      ],
      "maxSelect": 10,
      "maxSize": 5242880,
      "protected": false
    }
  }))

  return dao.saveCollection(collection)
})
