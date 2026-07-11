/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "y5btq4tagbkvmng",
    "created": "2026-07-11 16:49:55.116Z",
    "updated": "2026-07-11 16:49:55.116Z",
    "name": "blocked_dates",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "33jlcbwq",
        "name": "date",
        "type": "date",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "fkg2tn2z",
        "name": "reason",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_blocked_date` ON `blocked_dates` (`date`)"
    ],
    "listRule": "",
    "viewRule": "",
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("y5btq4tagbkvmng");

  return dao.deleteCollection(collection);
})
