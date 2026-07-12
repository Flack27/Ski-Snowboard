/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "julochqg89j9knf",
    "created": "2026-07-12 12:04:45.134Z",
    "updated": "2026-07-12 12:04:45.134Z",
    "name": "payment_settings",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "41c1fahg",
        "name": "online_enabled",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "vfjlmgl5",
        "name": "pickup_enabled",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "miustkrv",
        "name": "mollie_api_key",
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
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("julochqg89j9knf");

  return dao.deleteCollection(collection);
})
