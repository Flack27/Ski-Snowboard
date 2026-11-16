/// <reference path="../pb_data/types.d.ts" />
// bookings.service was a select limited to the four launch services. Services are
// editable in the admin now, so any renamed or new service made every booking fail.
// Same field id and name, so SQLite keeps the column (both types store TEXT) and
// existing bookings keep their value. New bookings store the service's name.
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ah75h6bg7rwpcwu")

  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nxfi9jvk",
    "name": "service",
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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ah75h6bg7rwpcwu")

  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nxfi9jvk",
    "name": "service",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "waxen",
        "slijpen",
        "waxen-slijpen",
        "onderhoud"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
