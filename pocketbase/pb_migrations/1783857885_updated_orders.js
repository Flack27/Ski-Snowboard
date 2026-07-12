/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("g63t0bzfqv1jyfy")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qrm0zu2q",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "open",
        "paid",
        "failed",
        "expired",
        "canceled",
        "refunded",
        "reserved"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("g63t0bzfqv1jyfy")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qrm0zu2q",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "open",
        "paid",
        "failed",
        "expired",
        "canceled",
        "refunded"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
