/**
 * Migration: 006_optimize_indexes
 * Description: Creates compound ESR indexes for optimized filtering and stable sorting
 */

module.exports = {
  id: '006_optimize_indexes',
  description: 'Add compound indexes for leads, tasks, and companies to eliminate in-memory sorting',

  async up(db) {
    console.log('  [Up] Creating optimized compound indexes...');

    // 1. Leads compound indexes
    await db.collection('leads').createIndex({ isDeleted: 1, status: 1, createdAt: -1, _id: -1 });
    await db.collection('leads').createIndex({ isDeleted: 1, assignedTo: 1, createdAt: -1, _id: -1 });
    await db.collection('leads').createIndex({ company: 1, isDeleted: 1 });
    await db.collection('leads').createIndex({ createdAt: -1, _id: -1 });

    // 2. Tasks compound indexes
    await db.collection('tasks').createIndex({ assignedTo: 1, status: 1, dueDate: 1, _id: -1 });
    await db.collection('tasks').createIndex({ status: 1, dueDate: 1, _id: -1 });
    await db.collection('tasks').createIndex({ dueDate: 1, createdAt: -1, _id: -1 });

    // 3. Companies compound indexes
    await db.collection('companies').createIndex({ industry: 1, createdAt: -1, _id: -1 });
    await db.collection('companies').createIndex({ createdAt: -1, _id: -1 });

    console.log('  ✔ Optimized compound indexes created successfully.');
  },

  async down(db) {
    console.log('  [Down] Dropping optimized compound indexes...');

    try {
      await db.collection('leads').dropIndex({ isDeleted: 1, status: 1, createdAt: -1, _id: -1 });
      await db.collection('leads').dropIndex({ isDeleted: 1, assignedTo: 1, createdAt: -1, _id: -1 });
      await db.collection('leads').dropIndex({ company: 1, isDeleted: 1 });
      await db.collection('leads').dropIndex({ createdAt: -1, _id: -1 });
      await db.collection('tasks').dropIndex({ assignedTo: 1, status: 1, dueDate: 1, _id: -1 });
      await db.collection('tasks').dropIndex({ status: 1, dueDate: 1, _id: -1 });
      await db.collection('tasks').dropIndex({ dueDate: 1, createdAt: -1, _id: -1 });
      await db.collection('companies').dropIndex({ industry: 1, createdAt: -1, _id: -1 });
      await db.collection('companies').dropIndex({ createdAt: -1, _id: -1 });
      console.log('  ✔ Optimized compound indexes dropped.');
    } catch (err) {
      console.warn('  Index drop warning:', err.message);
    }
  }
};
