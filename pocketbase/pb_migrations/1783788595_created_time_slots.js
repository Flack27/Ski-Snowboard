/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "nnevbbo3x00wq2c",
    "created": "2026-07-11 16:49:55.108Z",
    "updated": "2026-07-11 16:49:55.108Z",
    "name": "time_slots",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "pizyrdzw",
        "name": "time",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "esq5llx4",
        "name": "sort",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": true
        }
      },
      {
        "system": false,
        "id": "qclxijih",
        "name": "active",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_time_slots_time` ON `time_slots` (`time`)"
    ],
    "listRule": "active = true",
    "viewRule": "active = true",
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("nnevbbo3x00wq2c");

  return dao.deleteCollection(collection);
})
