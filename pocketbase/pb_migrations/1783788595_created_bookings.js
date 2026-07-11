/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "ah75h6bg7rwpcwu",
    "created": "2026-07-11 16:49:55.104Z",
    "updated": "2026-07-11 16:49:55.104Z",
    "name": "bookings",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "pgdwmjo5",
        "name": "ref",
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
        "id": "qkzv0p4b",
        "name": "name",
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
        "id": "p4lxwkhp",
        "name": "email",
        "type": "email",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "exceptDomains": null,
          "onlyDomains": null
        }
      },
      {
        "system": false,
        "id": "e5xhlpdh",
        "name": "phone",
        "type": "text",
        "required": false,
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
      },
      {
        "system": false,
        "id": "uypxfpin",
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
        "id": "ffv4o0x0",
        "name": "time_slot",
        "type": "text",
        "required": false,
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
        "id": "abdelhlk",
        "name": "note",
        "type": "text",
        "required": false,
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
        "id": "oiha0mqp",
        "name": "status",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "nieuw",
            "bevestigd",
            "klaar",
            "geannuleerd"
          ]
        }
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_bookings_ref` ON `bookings` (`ref`)",
      "CREATE UNIQUE INDEX `idx_bookings_slot` ON `bookings` (\n  `date`,\n  `time_slot`\n) WHERE `status` != 'geannuleerd'"
    ],
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
  const collection = dao.findCollectionByNameOrId("ah75h6bg7rwpcwu");

  return dao.deleteCollection(collection);
})
