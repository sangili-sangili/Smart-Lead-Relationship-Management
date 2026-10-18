/**
 * Migration: 001_create_users_table
 * Description: Creates 'users' collection with schema validation and indexes
 */

module.exports = {
  id: '001_create_users_table',
  description: 'Create users collection with schema validator and email unique index',

  async up(db) {
    console.log('  [Up] Creating "users" collection...');
    
    // Check if collection already exists
    const collections = await db.listCollections({ name: 'users' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('users', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'email', 'password'],
            properties: {
              name: {
                bsonType: 'string',
                maxLength: 100,
                description: 'User display name is required'
              },
              email: {
                bsonType: 'string',
                pattern: '^\\S+@\\S+\\.\\S+$',
                description: 'Unique email address is required'
              },
              password: {
                bsonType: 'string',
                description: 'Bcrypt hashed password is required'
              },
              role: {
                enum: ['Admin', 'Sales Rep', 'User'],
                description: 'Role must be Admin, Sales Rep, or User'
              },
              avatar: {
                bsonType: 'string',
                description: 'Optional avatar image URL'
              },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: 'date' }
            }
          }
        }
      });
    }

    // Create unique index on email
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('  ✔ "users" collection and indexes created successfully.');
  },

  async down(db) {
    console.log('  [Down] Dropping "users" collection...');
    const collections = await db.listCollections({ name: 'users' }).toArray();
    if (collections.length > 0) {
      await db.collection('users').drop();
      console.log('  ✔ "users" collection dropped.');
    }
  }
};
