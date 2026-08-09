# Deduplicate `api_keys` and create unique index

This document lists safe steps to detect and remove duplicate `ApiKey` documents that share the same `(subscription, consumer)` pair, then create a unique compound index.

IMPORTANT: BACKUP your database before running any delete operations.

## 1) Inspect duplicates

Run in the `mongo` shell or via `mongosh` against your database:

```js
// show groups with more than one ApiKey per subscription+consumer
db.api_keys.aggregate([
  { $group: { _id: { sub: "$subscription.$id", cons: "$consumer.$id" }, count: { $sum: 1 }, docs: { $push: "$_id" } } },
  { $match: { count: { $gt: 1 } } },
  { $sort: { "count": -1 } }
])
```

## 2) Option: Keep latest `createdAt`, remove older duplicates

Review results from step 1 to confirm which groups are duplicated. Then for each duplicated group you can keep the most recent and remove others. Example pipeline to remove duplicates while keeping the newest:

```js
// WARNING: run with care, test on a copy first
const bulk = [];
const cursor = db.api_keys.aggregate([
  { $sort: { createdAt: -1 } },
  { $group: { _id: { sub: "$subscription.$id", cons: "$consumer.$id" }, ids: { $push: "$_id" }, count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
]);

while (cursor.hasNext()) {
  const g = cursor.next();
  // keep first id (newest), remove rest
  const idsToRemove = g.ids.slice(1);
  idsToRemove.forEach(id => bulk.push({ deleteOne: { filter: { _id: id } } }));
}

if (bulk.length) db.api_keys.bulkWrite(bulk);
```

## 3) Create compound unique index

Once duplicates are removed and you have confirmed behavior, create the unique index to prevent future duplicates.

```js
// For DBRefs that store referenced id under subscription.$id / consumer.$id
db.api_keys.createIndex({"subscription.$id": 1, "consumer.$id": 1}, { unique: true, name: "subscription_consumer_uidx" })
```

Note: if your `subscription` and `consumer` fields are stored differently (not DBRef), adjust the index keys accordingly (e.g., `subscription` and `consumer` directly).

## 4) Application change (already applied)

We updated the code to:
- Add a compound index annotation in the `ApiKey` entity (so new deployments will be aware), and
- Change the repository method to `findFirstBySubscriptionAndConsumerOrderByCreatedAtDesc(...)` to defensively pick the latest API key while you perform DB cleanup.

After running the DB cleanup and creating the unique index, you can keep the repository change or revert to the single-name `findBySubscriptionAndConsumer(...)` if you prefer the stricter semantics.

## Backup tip

Dump the collection first:

```bash
mongodump --db yourDbName --collection api_keys --out /path/to/backup
```

## Next steps
- Run the inspection query and share results if you'd like help selecting which documents to delete.
- Run the dedupe script on a staging copy first.
- Create the unique index after confirming duplicates are removed.
