/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "g63t0bzfqv1jyfy",
    "created": "2026-07-11 16:49:55.101Z",
    "updated": "2026-07-11 16:49:55.101Z",
    "name": "orders",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "dips6hhg",
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
        "id": "h3d3if80",
        "name": "line_items",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      },
      {
        "system": false,
        "id": "rdxh0dz9",
        "name": "customer_email",
        "type": "email",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "exceptDomains": null,
          "onlyDomains": null
        }
      },
      {
        "system": false,
        "id": "oq5b7cxf",
        "name": "customer_name",
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
        "id": "8ysgr5r7",
        "name": "customer_phone",
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
        "id": "tfxmoxeo",
        "name": "amount",
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
        "id": "9ldmemww",
        "name": "mollie_payment_id",
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
      },
      {
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
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_orders_ref` ON `orders` (`ref`)",
      "CREATE UNIQUE INDEX `idx_orders_mollie` ON `orders` (`mollie_payment_id`) WHERE `mollie_payment_id` != ''"
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
  const collection = dao.findCollectionByNameOrId("g63t0bzfqv1jyfy");

  return dao.deleteCollection(collection);
})
