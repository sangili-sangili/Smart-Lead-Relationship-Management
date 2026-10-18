const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const { User, Company, Lead, Task, Notification } = require('../models');

const seedDatabase = async (isDirectRun = (require.main === module)) => {
  try {
    console.log('==================================================');
    console.log('  Starting LeadFlow CRM Database Migration & Seed ');
    console.log('==================================================');

    await connectDB();

    console.log('\n[1/6] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Lead.deleteMany({ includeDeleted: true }),
      Task.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('✔ Collections cleared.');

    console.log('\n[2/6] Seeding Users with hashed credentials...');
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'admin@mini.crm',
        password: 'password123',
        role: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      },
      {
        name: 'LeadFlow Admin',
        email: 'admin@leadflow.com',
        password: 'password123',
        role: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      },
      {
        name: 'Sarah Lee',
        email: 'sarah.lee@mini.crm',
        password: 'password123',
        role: 'Sales Rep',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
      },
      {
        name: 'Mike Ross',
        email: 'mike.ross@mini.crm',
        password: 'password123',
        role: 'Sales Rep',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      }
    ]);
    console.log(`✔ Seeded ${users.length} users.`);

    const userMap = {};
    users.forEach((u) => {
      userMap[u.name] = u._id;
    });

    console.log('\n[3/5] Seeding Companies...');
    const companies = await Company.create([
      {
        name: 'ABC Corp',
        industry: 'IT',
        location: 'Chennai',
        website: 'www.abc-corp.com',
        email: 'contact@abc-corp.com',
        phone: '+91 (044) 4321-8765',
        description: 'Leading provider of enterprise IT architecture and cloud consulting services.'
      },
      {
        name: 'TechSol',
        industry: 'Software',
        location: 'Bangalore',
        website: 'www.techsol.io',
        email: 'hello@techsol.io',
        phone: '+91 (080) 6543-2109',
        description: 'Specialized in scalable microservices and full-stack SaaS solutions.'
      },
      {
        name: 'Globex',
        industry: 'Manufacturing',
        location: 'Coimbatore',
        website: 'www.globex.org',
        email: 'info@globex.org',
        phone: '+91 (0422) 2345-6789',
        description: 'Precision manufacturing and industrial robotics hardware distribution.'
      },
      {
        name: 'NextGen',
        industry: 'Healthcare',
        location: 'Madurai',
        website: 'www.nextgen.tech',
        email: 'support@nextgen.tech',
        phone: '+91 (0452) 7890-1234',
        description: 'Digital health monitoring systems and diagnostic AI platforms.'
      },
      {
        name: 'Acme Corp',
        industry: 'Finance',
        location: 'Trichy',
        website: 'www.acme-corp.com',
        email: 'finance@acme-corp.com',
        phone: '+91 (0431) 3456-7890',
        description: 'Algorithmic financial trading tools and corporate investment solutions.'
      }
    ]);
    console.log(`✔ Seeded ${companies.length} companies.`);

    const compMap = {};
    companies.forEach((c) => {
      compMap[c.name] = c._id;
    });

    console.log('\n[4/5] Seeding Leads...');
    const leads = await Lead.create([
      {
        name: 'Ravi Kumar',
        email: 'ravi@mail.com',
        phone: '+1 (555) 234-5678',
        status: 'New',
        company: compMap['ABC Corp'],
        assignedTo: userMap['John Doe']
      },
      {
        name: 'Priya Sharma',
        email: 'priya@mail.com',
        phone: '+1 (555) 876-5432',
        status: 'Contacted',
        company: compMap['TechSol'],
        assignedTo: userMap['Sarah Lee']
      },
      {
        name: 'Suresh Patel',
        email: 'suresh@mail.com',
        phone: '+1 (555) 345-6789',
        status: 'Qualified',
        company: compMap['Globex'],
        assignedTo: userMap['Mike Ross']
      },
      {
        name: 'Anita Roy',
        email: 'anita@mail.com',
        phone: '+1 (555) 987-6543',
        status: 'New',
        company: compMap['NextGen'],
        assignedTo: userMap['John Doe']
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@mail.com',
        phone: '+1 (555) 456-7890',
        status: 'Lost',
        company: compMap['Acme Corp'],
        assignedTo: userMap['Sarah Lee']
      },
      {
        name: 'Sarah Jenkins',
        email: 'sarah.j@acme.com',
        phone: '+1 (555) 567-8901',
        status: 'Converted',
        company: compMap['Acme Corp'],
        assignedTo: userMap['Mike Ross']
      },
      {
        name: 'Amit Verma',
        email: 'amit.v@techsol.io',
        phone: '+1 (555) 678-9012',
        status: 'Contacted',
        company: compMap['TechSol'],
        assignedTo: userMap['John Doe']
      },
      {
        name: 'Deepa Menon',
        email: 'deepa@globex.org',
        phone: '+1 (555) 789-0123',
        status: 'Qualified',
        company: compMap['Globex'],
        assignedTo: userMap['Sarah Lee']
      },
      {
        name: 'Karan Mehta',
        email: 'karan@nextgen.tech',
        phone: '+1 (555) 890-1234',
        status: 'New',
        company: compMap['NextGen'],
        assignedTo: userMap['Mike Ross']
      },
      {
        name: 'Neha Reddy',
        email: 'neha@abccorp.in',
        phone: '+1 (555) 901-2345',
        status: 'Converted',
        company: compMap['ABC Corp'],
        assignedTo: userMap['John Doe']
      },
      // Sample soft-deleted lead for verifying query exclusion
      {
        name: 'Arun Kumar (Archived)',
        email: 'arun.archived@mail.com',
        phone: '+1 (555) 111-2222',
        status: 'Lost',
        company: compMap['ABC Corp'],
        assignedTo: userMap['Sarah Lee'],
        isDeleted: true,
        deletedAt: new Date(Date.now() - 86400000 * 30)
      }
    ]);
    console.log(`✔ Seeded ${leads.length} leads (including 1 soft-deleted lead).`);

    const leadMap = {};
    leads.forEach((l) => {
      leadMap[l.name] = l._id;
    });

    console.log('\n[5/5] Seeding Tasks...');
    const now = new Date();
    const tasks = await Task.create([
      {
        title: 'Call with Ravi',
        lead: leadMap['Ravi Kumar'],
        assignedTo: userMap['John Doe'],
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0),
        status: 'Pending',
        priority: 'High',
        description: 'Quarterly review call to discuss enterprise cloud expansion requirements.'
      },
      {
        title: 'Send proposal',
        lead: leadMap['Priya Sharma'],
        assignedTo: userMap['Sarah Lee'],
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 30),
        status: 'In Progress',
        priority: 'Medium',
        description: 'Finalize multi-region SaaS architecture scope document and send draft.'
      },
      {
        title: 'Follow up',
        lead: leadMap['Suresh Patel'],
        assignedTo: userMap['Mike Ross'],
        dueDate: new Date(Date.now() + 86400000 * 1),
        status: 'Pending',
        priority: 'Medium',
        description: 'Verify security compliance sign-off from IT procurement committee.'
      },
      {
        title: 'Demo call',
        lead: leadMap['Anita Roy'],
        assignedTo: userMap['John Doe'],
        dueDate: new Date(Date.now() + 86400000 * 2),
        status: 'Completed',
        priority: 'Low',
        description: 'Demonstrated automated sales pipeline triggers and workflow reporting.'
      },
      {
        title: 'Send quote',
        lead: leadMap['Vikram Singh'],
        assignedTo: userMap['Sarah Lee'],
        dueDate: new Date(Date.now() + 86400000 * 3),
        status: 'Pending',
        priority: 'High',
        description: 'Provide volume discount tiered pricing for 500+ seat enterprise license.'
      },
      {
        title: 'Contract review',
        lead: leadMap['Sarah Jenkins'],
        assignedTo: userMap['Mike Ross'],
        dueDate: new Date(Date.now() + 86400000 * 4),
        status: 'Completed',
        priority: 'High',
        description: 'Finalize standard SLA terms and master service agreement paperwork.'
      }
    ]);
    console.log(`✔ Seeded ${tasks.length} tasks.`);

    console.log('\n[6/6] Seeding Initial Notifications...');
    const notifications = await Notification.create([
      {
        title: 'New Lead Assigned',
        message: 'Ravi Kumar from ABC Corp has been assigned to you.',
        type: 'lead',
        action: 'assign',
        entityType: 'Lead',
        entityId: leadMap['Ravi Kumar'],
        recipient: userMap['John Doe'],
        actor: userMap['Sarah Lee'],
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 10) // 10m ago
      },
      {
        title: 'Task Due in 1 Hour',
        message: 'Call with ABC Corp scheduled for today at 10:00 AM.',
        type: 'task',
        action: 'status_change',
        entityType: 'Task',
        recipient: userMap['John Doe'],
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 45) // 45m ago
      },
      {
        title: 'Status Updated to Qualified',
        message: 'Priya Sharma was marked as Qualified by Sarah Lee.',
        type: 'status',
        action: 'status_change',
        entityType: 'Lead',
        entityId: leadMap['Priya Sharma'],
        recipient: null, // broadcast to all
        actor: userMap['Sarah Lee'],
        isRead: true,
        readAt: new Date(Date.now() - 1000 * 60 * 60),
        createdAt: new Date(Date.now() - 1000 * 60 * 120) // 2h ago
      },
      {
        title: 'Pipeline Milestone Reached',
        message: 'Team achieved +12% lead conversion rate this week!',
        type: 'milestone',
        action: 'other',
        recipient: null,
        isRead: true,
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1d ago
      }
    ]);
    console.log(`✔ Seeded ${notifications.length} notifications.`);

    console.log('\n==================================================');
    console.log('       Migration & Seeding Completed!             ');
    console.log('==================================================');
    console.log('Login Credentials:');
    console.log('  Admin:       admin@mini.crm     / password123');
    console.log('  Sales Rep 1: sarah.lee@mini.crm / password123');
    console.log('  Sales Rep 2: mike.ross@mini.crm / password123');
    console.log('==================================================\n');

    if (isDirectRun) {
      await disconnectDB();
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error('\n❌ Seeding failed with error:', error);
    if (isDirectRun) {
      await disconnectDB();
      process.exit(1);
    }
    throw error;
  }
};

// Execute if run directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
