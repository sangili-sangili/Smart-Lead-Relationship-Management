const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');

const MIGRATIONS_DIR = __dirname;
const TRACKING_COLLECTION = '_migrations';

/**
 * Get all migration files ordered by name
 */
const getMigrationFiles = () => {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.match(/^\d{3}_.+\.js$/))
    .sort();
};

/**
 * Run 'up' migrations
 */
const runUp = async (db) => {
  console.log('\n=============================================');
  console.log('       Running Database Migrations (UP)      ');
  console.log('=============================================');

  const files = getMigrationFiles();
  const trackingCol = db.collection(TRACKING_COLLECTION);
  const applied = await trackingCol.find({}).toArray();
  const appliedSet = new Set(applied.map((m) => m.id));

  let appliedCount = 0;

  for (const file of files) {
    const migration = require(path.join(MIGRATIONS_DIR, file));
    const migrationId = migration.id || file.replace(/\.js$/, '');

    if (appliedSet.has(migrationId)) {
      console.log(`- [Skipping] ${migrationId} (already applied)`);
      continue;
    }

    console.log(`\n▶ [Migrating] ${migrationId}: ${migration.description || ''}`);
    await migration.up(db);

    await trackingCol.insertOne({
      id: migrationId,
      file,
      executedAt: new Date()
    });

    appliedCount++;
  }

  console.log('\n=============================================');
  console.log(` Migration UP complete. ${appliedCount} migration(s) applied.`);
  console.log('=============================================\n');
};

/**
 * Run 'down' (rollback) last migration
 */
const runDown = async (db) => {
  console.log('\n=============================================');
  console.log('      Rolling Back Last Migration (DOWN)     ');
  console.log('=============================================');

  const trackingCol = db.collection(TRACKING_COLLECTION);
  const lastApplied = await trackingCol.find({}).sort({ executedAt: -1 }).limit(1).toArray();

  if (lastApplied.length === 0) {
    console.log('No applied migrations found to roll back.');
    return;
  }

  const target = lastApplied[0];
  const filePath = path.join(MIGRATIONS_DIR, target.file);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Migration file not found: ${target.file}`);
  }

  const migration = require(filePath);
  console.log(`\n◀ [Rolling back] ${target.id}...`);
  await migration.down(db);

  await trackingCol.deleteOne({ id: target.id });

  console.log('\n=============================================');
  console.log(` Rollback complete for: ${target.id}`);
  console.log('=============================================\n');
};

/**
 * Show migration status table
 */
const showStatus = async (db) => {
  console.log('\n=============================================');
  console.log('             Migration Status                ');
  console.log('=============================================');

  const files = getMigrationFiles();
  const trackingCol = db.collection(TRACKING_COLLECTION);
  const applied = await trackingCol.find({}).toArray();
  const appliedMap = new Map(applied.map((m) => [m.id, m]));

  const statusList = files.map((file) => {
    const migration = require(path.join(MIGRATIONS_DIR, file));
    const id = migration.id || file.replace(/\.js$/, '');
    const isApplied = appliedMap.has(id);
    return {
      Migration: id,
      Status: isApplied ? '✔ Applied' : '⏳ Pending',
      ExecutedAt: isApplied ? appliedMap.get(id).executedAt.toISOString() : '-'
    };
  });

  console.table(statusList);
  console.log('=============================================\n');
};

/**
 * Main CLI dispatcher
 */
const main = async () => {
  const command = (process.argv[2] || 'up').toLowerCase();

  try {
    const connection = await connectDB();
    const db = connection.db;

    if (command === 'up') {
      await runUp(db);
    } else if (command === 'down') {
      await runDown(db);
    } else if (command === 'status') {
      await showStatus(db);
    } else if (command === 'reset') {
      console.log('Resetting all migrations...');
      while (true) {
        const last = await db.collection(TRACKING_COLLECTION).findOne({}, { sort: { executedAt: -1 } });
        if (!last) break;
        await runDown(db);
      }
    } else {
      console.log(`Unknown command: "${command}". Available commands: up, down, status, reset`);
    }

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    await disconnectDB();
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { runUp, runDown, showStatus };
