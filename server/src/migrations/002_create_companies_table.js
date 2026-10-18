/**
 * Migration: 002_create_companies_table
 * Description: Creates 'companies' collection with schema validation and indexes
 */

module.exports = {
  id: '002_create_companies_table',
  description: 'Create companies collection with schema validator and indexes',

  async up(db) {
    console.log('  [Up] Creating "companies" collection...');

    const collections = await db.listCollections({ name: 'companies' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('companies', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name'],
            properties: {
              name: {
                bsonType: 'string',
                maxLength: 120,
                description: 'Company name is required'
              },
              industry: {
                bsonType: 'string',
                description: 'Industry domain'
              },
              location: {
                bsonType: 'string',
                description: 'Geographic location / city'
              },
              website: {
                bsonType: 'string',
                description: 'Company website URL'
              },
              email: {
                bsonType: 'string',
                description: 'Contact email'
              },
              phone: {
                bsonType: 'string',
                description: 'Contact phone'
              },
              description: {
                bsonType: 'string',
                description: 'Company description'
              },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: 'date' }
            }
          }
        }
      });
    }

    // Indexes
    await db.collection('companies').createIndex({ name: 1 }, { unique: true });
    await db.collection('companies').createIndex({ industry: 1 });
    console.log('  ✔ "companies" collection and indexes created successfully.');
  },

  async down(db) {
    console.log('  [Down] Dropping "companies" collection...');
    const collections = await db.listCollections({ name: 'companies' }).toArray();
    if (collections.length > 0) {
      await db.collection('companies').drop();
      console.log('  ✔ "companies" collection dropped.');
    }
  }
};
