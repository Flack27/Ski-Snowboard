/// <reference path="../pb_data/types.d.ts" />
// Slots used to run on every open day. Adds a weekday multiselect so a slot can
// be limited to e.g. di+do while another runs on za only. Empty = every open day,
// which is what existing slots have, so they keep their current behaviour.
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nnevbbo3x00wq2c")

  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wkdayslt",
    "name": "days",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 7,
      "values": [
        "ma",
        "di",
        "wo",
        "do",
        "vr",
        "za",
        "zo"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nnevbbo3x00wq2c")

  collection.schema.removeField("wkdayslt")

  return dao.saveCollection(collection)
})
