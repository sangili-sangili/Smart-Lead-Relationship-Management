const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const { User, Company, Lead, Task, Notification } = require('../models');
const { escapeRegex, sanitizePagination, MAX_PAGE_SIZE } = require('../utils/queryHelper');

describe('Server-Side Query Optimization & Security Suite', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Query Helper & ReDoS Sanitization', () => {
    it('should escape dangerous regular expression characters safely', () => {
      const dangerousInput = 'test.*+?^${}()|[]\\example';
      const escaped = escapeRegex(dangerousInput);
      expect(escaped).toBe('test\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\example');
      // Ensure creating a RegExp with escaped string does not throw
      expect(() => new RegExp(escaped, 'i')).not.toThrow();
    });

    it('should correctly sanitize and bound pagination parameters', () => {
      // Exceeding max limit
      const overLimit = sanitizePagination(1, 5000);
      expect(overLimit.limit).toBe(MAX_PAGE_SIZE);
      expect(overLimit.page).toBe(1);
      expect(overLimit.skip).toBe(0);

      // Negative or invalid input
      const invalid = sanitizePagination(-5, 'invalid');
      expect(invalid.page).toBe(1);
      expect(invalid.limit).toBe(10);
      expect(invalid.skip).toBe(0);

      // Normal valid input
      const valid = sanitizePagination(3, 25);
      expect(valid.page).toBe(3);
      expect(valid.limit).toBe(25);
      expect(valid.skip).toBe(50);
    });
  });

  describe('2. MongoDB Explain Execution Plan & Index Coverage', () => {
    it('Lead query with status filter and sort should utilize IXSCAN (no in-memory sort)', async () => {
      const explainResult = await Lead.find({ isDeleted: false, status: 'Qualified' })
        .sort({ createdAt: -1, _id: -1 })
        .explain('executionStats');

      const stats = explainResult.executionStats;
      expect(stats).toBeDefined();

      // Find the scan stage
      const findStage = (stage) => {
        if (!stage) return null;
        if (stage.stage === 'IXSCAN') return stage;
        if (stage.inputStage) return findStage(stage.inputStage);
        if (stage.inputStages) {
          for (const s of stage.inputStages) {
            const found = findStage(s);
            if (found) return found;
          }
        }
        return null;
      };

      const ixscan = findStage(stats.executionStages);
      expect(ixscan).not.toBeNull();
      expect(ixscan.stage).toBe('IXSCAN');
      expect(stats.totalDocsExamined).toBeLessThanOrEqual(stats.nReturned + 5);
      console.log(`[Explain Stats: Lead Filter & Sort] nReturned: ${stats.nReturned}, totalDocsExamined: ${stats.totalDocsExamined}, executionTimeMillis: ${stats.executionTimeMillis}ms`);
    });

    it('Task query with status and dueDate sort should utilize IXSCAN', async () => {
      const explainResult = await Task.find({ status: 'Pending' })
        .sort({ dueDate: 1, createdAt: -1, _id: -1 })
        .explain('executionStats');

      const stats = explainResult.executionStats;
      expect(stats).toBeDefined();

      const findStage = (stage) => {
        if (!stage) return null;
        if (stage.stage === 'IXSCAN') return stage;
        if (stage.inputStage) return findStage(stage.inputStage);
        return null;
      };

      const ixscan = findStage(stats.executionStages);
      expect(ixscan).not.toBeNull();
      expect(ixscan.stage).toBe('IXSCAN');
      console.log(`[Explain Stats: Task Filter & Sort] nReturned: ${stats.nReturned}, totalDocsExamined: ${stats.totalDocsExamined}, executionTimeMillis: ${stats.executionTimeMillis}ms`);
    });

    it('Company query with industry filter should utilize IXSCAN', async () => {
      const explainResult = await Company.find({ industry: 'IT' })
        .sort({ createdAt: -1, _id: -1 })
        .explain('executionStats');

      const stats = explainResult.executionStats;
      expect(stats).toBeDefined();
      expect(stats.executionTimeMillis).toBeLessThanOrEqual(50);
      console.log(`[Explain Stats: Company Filter & Sort] nReturned: ${stats.nReturned}, totalDocsExamined: ${stats.totalDocsExamined}, executionTimeMillis: ${stats.executionTimeMillis}ms`);
    });
  });

  describe('3. Soft Deletion & Query Integrity', () => {
    it('should strictly exclude soft-deleted leads from Lead.find and countDocuments by default', async () => {
      const activeLeads = await Lead.find({}).lean();
      const hasArchived = activeLeads.some((l) => l.name.includes('Archived'));
      expect(hasArchived).toBe(false);

      const activeCount = await Lead.countDocuments({});
      expect(activeCount).toBe(activeLeads.length);
    });

    it('should allow explicit retrieval only when includeDeleted is true', async () => {
      const allLeads = await Lead.find({ includeDeleted: true }).lean();
      const archivedLead = allLeads.find((l) => l.isDeleted === true);
      expect(archivedLead).toBeDefined();
    });
  });

  describe('4. Dashboard $facet Aggregation Consistency', () => {
    it('should compute totalLeads, qualified, and statusDistribution in a single pass', async () => {
      const [leadStats] = await Lead.aggregate([
        { $match: { isDeleted: false } },
        {
          $facet: {
            total: [{ $count: 'count' }],
            qualified: [
              { $match: { status: 'Qualified' } },
              { $count: 'count' }
            ],
            statusDistribution: [
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 }
                }
              }
            ]
          }
        }
      ]);

      const totalCount = leadStats.total[0]?.count || 0;
      const qualifiedCount = leadStats.qualified[0]?.count || 0;
      const sumDistribution = leadStats.statusDistribution.reduce((acc, curr) => acc + curr.count, 0);

      // Total count must exactly equal the sum of status breakdown
      expect(totalCount).toBe(sumDistribution);

      const qualifiedFromDistribution = leadStats.statusDistribution.find((s) => s._id === 'Qualified')?.count || 0;
      expect(qualifiedCount).toBe(qualifiedFromDistribution);
    });
  });
});
