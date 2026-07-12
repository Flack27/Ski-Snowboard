/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xnvjtg1wn6cjjd4")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qktxubmy",
    "name": "reservation_email",
    "type": "editor",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "convertUrls": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "mzljmny6",
    "name": "order_email",
    "type": "editor",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "convertUrls": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xnvjtg1wn6cjjd4")

  // remove
  collection.schema.removeField("qktxubmy")

  // remove
  collection.schema.removeField("mzljmny6")

  return dao.saveCollection(collection)
})
