/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("g63t0bzfqv1jyfy")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qhnf58w3",
    "name": "customer_address",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nm6yuexi",
    "name": "customer_postal",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ecxixt4u",
    "name": "customer_city",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "4f2tresx",
    "name": "fulfilment",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "pickup",
        "shipping"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("g63t0bzfqv1jyfy")

  // remove
  collection.schema.removeField("qhnf58w3")

  // remove
  collection.schema.removeField("nm6yuexi")

  // remove
  collection.schema.removeField("ecxixt4u")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "4f2tresx",
    "name": "fulfilment",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "pickup"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
