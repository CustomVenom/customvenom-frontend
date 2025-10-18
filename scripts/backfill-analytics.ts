/**
 * Backfill script: Migrate analytics events from localStorage to database
 * Run this once after database migration to preserve existing analytics data
 * 
 * Usage: npm run backfill-analytics
 */

import { PrismaClient } from '@prisma/client';

const _prisma = new PrismaClient();

interface _LocalStorageEvent {
  id: string;
  event_type: string;
  tool_name?: string;
  action?: string;
  properties?: Record<string, unknown>;
  user_id?: string;
  session_id: string;
  timestamp: string;
  demo_mode: boolean;
}

/**
 * Backfill events from localStorage JSON export
 * 
 * How to use:
 * 1. In browser console: localStorage.getItem('cv_analytics_events')
 * 2. Copy the JSON output
 * 3. Save to a file: events-backup.json
 * 4. Update EVENTS_FILE path below
 * 5. Run: npx tsx scripts/backfill-analytics.ts
 */
async function backfillEvents() {
  console.log('🔄 Starting analytics backfill...\n');
  
  // For manual backfill:
  // 1. Export from localStorage in browser
  // 2. Parse JSON
  // 3. Insert into database
  
  console.log('📋 Manual Backfill Instructions:');
  console.log('');
  console.log('1. In browser console, run:');
  console.log('   localStorage.getItem("cv_analytics_events")');
  console.log('');
  console.log('2. Copy the output JSON');
  console.log('');
  console.log('3. Parse and insert into database:');
  console.log('');
  console.log('   const events = JSON.parse(copiedJson);');
  console.log('   for (const event of events) {');
  console.log('     await prisma.analyticsEvent.create({');
  console.log('       data: {');
  console.log('         sessionId: event.session_id,');
  console.log('         eventType: event.event_type,');
  console.log('         toolName: event.tool_name || null,');
  console.log('         action: event.action || null,');
  console.log('         properties: event.properties || {},');
  console.log('         demoMode: event.demo_mode ?? true,');
  console.log('         timestamp: new Date(event.timestamp),');
  console.log('       },');
  console.log('     });');
  console.log('   }');
  console.log('');
  console.log('✅ For automated backfill, uncomment the code below and provide events.json');
  
  // Uncomment for automated backfill:
  /*
  const fs = require('fs');
  const eventsJson = fs.readFileSync('./events-backup.json', 'utf-8');
  const events: _LocalStorageEvent[] = JSON.parse(eventsJson);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const event of events) {
    try {
      await _prisma.analyticsEvent.create({
        data: {
          userId: event.user_id || null,
          sessionId: event.session_id,
          eventType: event.event_type,
          toolName: event.tool_name || null,
          action: event.action || null,
          properties: event.properties || {},
          demoMode: event.demo_mode ?? true,
          timestamp: new Date(event.timestamp),
        },
      });
      successCount++;
    } catch (error) {
      console.error(`Failed to import event ${event.id}:`, error);
      errorCount++;
    }
  }
  
  console.log(`\n✅ Backfill complete!`);
  console.log(`   Imported: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  */
}

// Run backfill
backfillEvents()
  .then(() => {
    console.log('\n✅ Backfill script complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Backfill script failed:', error);
    process.exit(1);
  });

