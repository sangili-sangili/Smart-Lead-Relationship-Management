/**
 * Migration: 003_create_leads_table
 * Description: Creates 'leads' collection with schema validation, soft-delete flags, and compound indexes
 */

module.exports = {
  id: '003_create_leads_table',
  description: 'Create leads collection with soft-delete fields and compound indexes',

  async up(db) {
    console.log('  [Up] Creating "leads" collection...');

    const collections = await db.listCollections({ name: 'leads' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('leads', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'email', 'status', 'company'],
            properties: {
              name: {
                bsonType: 'string',
                maxLength: 100,
                description: 'Lead full name is required'
              },
              email: {
                bsonType: 'string',
                pattern: '^\\S+@\\S+\\.\\S+$',
                description: 'Valid email address is required'
              },
              phone: {
                bsonType: 'string',
                description: 'Contact phone'
              },
              status: {
                enum: ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'],
                description: 'Lead status is required'
              },
              company: {
                bsonType: 'objectId',
                description: 'Reference to company ObjectId is required'
              },
              assignedTo: {
                bsonType: ['objectId', 'null'],
                description: 'Reference to assigned user ObjectId or null'
              },
              isDeleted: {
                bsonType: 'bool',
                description: 'Soft-delete flag'
              },
              deletedAt: {
                bsonType: ['date', 'null'],
                description: 'Soft-delete timestamp'
              },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: 'date' }
            }
          }
        }
      });
    }

    // Compound & Performance Indexes
    await db.collection('leads').createIndex({ isDeleted: 1, status: 1 });
    await db.collection('leads').createIndex({ isDeleted: 1, company: 1 });
    await db.collection('leads').createIndex({ isDeleted: 1, assignedTo: 1 });
    await db.collection('leads').createIndex({ isDeleted: 1, name: 'text', email: 'text' });
    await db.collection('leads').createIndex({ createdAt: -1 });

    console.log('  ✔ "leads" collection and indexes created successfully.');
  },

  async down(db) {
    console.log('  [Down] Dropping "leads" collection...');
    const collections = await db.listCollections({ name: 'leads' }).toArray();
    if (collections.length > 0) {
      await db.collection('leads').drop();
      console.log('  ✔ "leads" collection dropped.');
    }
  }
};
