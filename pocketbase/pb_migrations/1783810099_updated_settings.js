/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xnvjtg1wn6cjjd4")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "js4vrrpm",
    "name": "shipping_enabled",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vatvtjwy",
    "name": "shipping_price",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": true
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xnvjtg1wn6cjjd4")

  // remove
  collection.schema.removeField("js4vrrpm")

  // remove
  collection.schema.removeField("vatvtjwy")

  return dao.saveCollection(collection)
})
