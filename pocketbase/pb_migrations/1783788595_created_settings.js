/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "xnvjtg1wn6cjjd4",
    "created": "2026-07-11 16:49:55.112Z",
    "updated": "2026-07-11 16:49:55.112Z",
    "name": "settings",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "9lilorhg",
        "name": "open_weekdays",
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
      },
      {
        "system": false,
        "id": "l48dfj0t",
        "name": "booking_horizon_days",
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
        "id": "oai9r626",
        "name": "lead_time_hours",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": true
        }
      }
    ],
    "indexes": [],
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
  const collection = dao.findCollectionByNameOrId("xnvjtg1wn6cjjd4");

  return dao.deleteCollection(collection);
})
