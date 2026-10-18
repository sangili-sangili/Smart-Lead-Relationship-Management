/**
 * Migration: 004_create_tasks_table
 * Description: Creates 'tasks' collection with schema validation and indexes
 */

module.exports = {
  id: '004_create_tasks_table',
  description: 'Create tasks collection with relational constraints and indexes',

  async up(db) {
    console.log('  [Up] Creating "tasks" collection...');

    const collections = await db.listCollections({ name: 'tasks' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('tasks', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'lead', 'assignedTo', 'dueDate'],
            properties: {
              title: {
                bsonType: 'string',
                maxLength: 200,
                description: 'Task title is required'
              },
              lead: {
                bsonType: 'objectId',
                description: 'Associated lead ObjectId is required'
              },
              assignedTo: {
                bsonType: 'objectId',
                description: 'Assigned user ObjectId is required'
              },
              dueDate: {
                bsonType: 'date',
                description: 'Due date is required'
              },
              status: {
                enum: ['Pending', 'In Progress', 'Completed'],
                description: 'Task status'
              },
              priority: {
                enum: ['High', 'Medium', 'Low'],
                description: 'Task priority'
              },
              description: {
                bsonType: 'string',
                description: 'Task details'
              },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: 'date' }
            }
          }
        }
      });
    }

    // Indexes
    await db.collection('tasks').createIndex({ assignedTo: 1, status: 1 });
    await db.collection('tasks').createIndex({ dueDate: 1 });
    await db.collection('tasks').createIndex({ lead: 1 });
    await db.collection('tasks').createIndex({ status: 1 });

    console.log('  ✔ "tasks" collection and indexes created successfully.');
  },

  async down(db) {
    console.log('  [Down] Dropping "tasks" collection...');
    const collections = await db.listCollections({ name: 'tasks' }).toArray();
    if (collections.length > 0) {
      await db.collection('tasks').drop();
      console.log('  ✔ "tasks" collection dropped.');
    }
  }
};
