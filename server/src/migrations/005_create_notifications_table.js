/**
 * Migration: 005_create_notifications_table
 * Description: Creates 'notifications' collection with schema validation and indexes
 */

module.exports = {
  id: '005_create_notifications_table',
  description: 'Create notifications collection for tracking create, edit, delete, and assign actions',

  async up(db) {
    console.log('  [Up] Creating "notifications" collection...');

    const collections = await db.listCollections({ name: 'notifications' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('notifications', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'message'],
            properties: {
              title: {
                bsonType: 'string',
                maxLength: 200,
                description: 'Notification title is required'
              },
              message: {
                bsonType: 'string',
                maxLength: 500,
                description: 'Notification message is required'
              },
              type: {
                enum: ['lead', 'task', 'company', 'status', 'milestone', 'system'],
                description: 'Category type'
              },
              action: {
                enum: ['create', 'update', 'delete', 'assign', 'status_change', 'other'],
                description: 'Action performed'
              },
              entityType: {
                enum: ['Lead', 'Task', 'Company', 'User', 'System'],
                description: 'Target entity type'
              },
              entityId: {
                bsonType: ['objectId', 'null'],
                description: 'Target entity ID'
              },
              recipient: {
                bsonType: ['objectId', 'null'],
                description: 'Target recipient user ID or null for broadcast'
              },
              actor: {
                bsonType: ['objectId', 'null'],
                description: 'User who performed the action'
              },
              isRead: {
                bsonType: 'bool',
                description: 'Whether notification is read'
              },
              readAt: {
                bsonType: ['date', 'null'],
                description: 'When notification was marked read'
              },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: 'date' }
            }
          }
        }
      });
    }

    // Indexes
    await db.collection('notifications').createIndex(
      { recipient: 1, isRead: 1, createdAt: -1 }
    );
    await db.collection('notifications').createIndex(
      { entityType: 1, entityId: 1 }
    );
    await db.collection('notifications').createIndex(
      { createdAt: -1 }
    );

    console.log('  ✔ "notifications" collection and indexes created successfully.');
  },

  async down(db) {
    console.log('  [Down] Dropping "notifications" collection...');
    const collections = await db.listCollections({ name: 'notifications' }).toArray();
    if (collections.length > 0) {
      await db.collection('notifications').drop();
      console.log('  ✔ "notifications" collection dropped.');
    }
  }
};
