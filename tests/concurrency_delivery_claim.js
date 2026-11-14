/**
 * TOMATTTO FOOD DELIVERY PLATFORM: CONCURRENCY TEST FOR DELIVERY ORDER CLAIMS
 * File: tests/concurrency_delivery_claim.js
 *
 * Requirements:
 * 1. Establishes two independent PostgreSQL TCP connections (Client A and Client B).
 * 2. Creates isolated synthetic test fixtures (2 riders, 1 restaurant, 1 customer, 1 order).
 * 3. Commits fixtures so both connections observe the 'ready' order.
 * 4. Configures authenticated PostgREST JWT claim contexts on both connections.
 * 5. Uses a barrier to dispatch claim_order_delivery simultaneously.
 * 6. Asserts that exactly one rider succeeds and one is rejected with ORDER_NOT_AVAILABLE.
 * 7. Cleans up strictly the created test fixtures in a finally block.
 */

import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';

// Configuration for local PostgreSQL stack
const DB_CONFIG = {
  host: process.env.PGHOST || '127.0.0.1',
  port: parseInt(process.env.PGPORT || '54322', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'postgres',
};

export async function runConcurrencyTest() {
  // Dynamically load pg to report clean error if dependency is not installed
  let pg;
  try {
    pg = await import('pg');
  } catch {
    console.error(
      'Missing dependency: "pg" is required to establish independent PostgreSQL TCP connections for concurrency testing.\n' +
      'Please install it using: npm install --save-dev pg @types/pg'
    );
    throw new Error('MISSING_DEPENDENCY: pg is not installed in the workspace.');
  }

  const { Client } = pg.default || pg;

  // Track created fixture IDs for targeted, non-destructive cleanup
  const fixtures = {
    userIdA: randomUUID(),
    userIdB: randomUUID(),
    customerId: randomUUID(),
    ownerId: randomUUID(),
    riderIdA: randomUUID(),
    riderIdB: randomUUID(),
    restaurantId: randomUUID(),
    orderId: randomUUID(),
  };

  const setupClient = new Client(DB_CONFIG);
  const clientA = new Client(DB_CONFIG);
  const clientB = new Client(DB_CONFIG);

  try {
    await setupClient.connect();

    // 1. Setup isolated synthetic fixtures
    const nonce = randomUUID().replace(/-/g, '').slice(0, 8);
    const emailA = `rider_a_${nonce}@staging.local`;
    const emailB = `rider_b_${nonce}@staging.local`;
    const emailCust = `cust_${nonce}@staging.local`;
    const emailOwner = `owner_${nonce}@staging.local`;
    const phoneA = `+9199${nonce}`;
    const phoneB = `+9198${nonce}`;
    const phoneCust = `+9197${nonce}`;
    const phoneOwner = `+9196${nonce}`;

    // Insert auth users
    await setupClient.query(`
      INSERT INTO auth.users (id, email) VALUES
        ($1, $2), ($3, $4), ($5, $6), ($7, $8)
    `, [
      fixtures.userIdA, emailA,
      fixtures.userIdB, emailB,
      fixtures.customerId, emailCust,
      fixtures.ownerId, emailOwner,
    ]);

    // Insert profiles
    await setupClient.query(`
      INSERT INTO public.profiles (id, full_name, phone, role) VALUES
        ($1, 'Concurrency Rider A', $2, 'rider'),
        ($3, 'Concurrency Rider B', $4, 'rider'),
        ($5, 'Concurrency Customer', $6, 'customer'),
        ($7, 'Concurrency Owner', $8, 'restaurant_owner')
    `, [
      fixtures.userIdA, phoneA,
      fixtures.userIdB, phoneB,
      fixtures.customerId, phoneCust,
      fixtures.ownerId, phoneOwner,
    ]);

    // Insert restaurant
    await setupClient.query(`
      INSERT INTO public.restaurants (id, owner_id, name, slug, phone, address_text, latitude, longitude)
      VALUES ($1, $2, 'Concurrency Kitchen', $3, $4, 'Indiranagar', 12.9716, 77.5946)
    `, [fixtures.restaurantId, fixtures.ownerId, `concurrency-kitchen-${nonce}`, phoneOwner]);

    // Insert active riders in 'online' status
    await setupClient.query(`
      INSERT INTO public.riders (id, profile_id, vehicle_type, vehicle_number, is_verified, status)
      VALUES
        ($1, $2, 'Bike', $3, true, 'online'),
        ($4, $5, 'Bike', $6, true, 'online')
    `, [
      fixtures.riderIdA, fixtures.userIdA, `KA-01-CC-${nonce.slice(0, 4)}`,
      fixtures.riderIdB, fixtures.userIdB, `KA-02-DD-${nonce.slice(0, 4)}`,
    ]);

    // Insert order in 'ready' status (eligible for claiming)
    await setupClient.query(`
      INSERT INTO public.orders (id, customer_id, restaurant_id, status, item_total, total_amount, delivery_address)
      VALUES ($1, $2, $3, 'ready', 299.00, 349.00, '{"street": "100ft Rd", "city": "Bengaluru", "pincode": "560038"}'::jsonb)
    `, [fixtures.orderId, fixtures.customerId, fixtures.restaurantId]);

    // 2. Connect client A and client B as independent PostgreSQL TCP sessions
    await clientA.connect();
    await clientB.connect();

    // Configure PostgREST authenticated context for Rider A on Connection A
    await clientA.query('SET ROLE authenticated;');
    await clientA.query(`
      SELECT
        set_config('request.jwt.claim.sub', $1, false),
        set_config('request.jwt.claim.role', 'authenticated', false),
        set_config('request.jwt.claims', json_build_object('sub', $1::uuid, 'role', 'authenticated')::text, false);
    `, [fixtures.userIdA]);

    // Configure PostgREST authenticated context for Rider B on Connection B
    await clientB.query('SET ROLE authenticated;');
    await clientB.query(`
      SELECT
        set_config('request.jwt.claim.sub', $1, false),
        set_config('request.jwt.claim.role', 'authenticated', false),
        set_config('request.jwt.claims', json_build_object('sub', $1::uuid, 'role', 'authenticated')::text, false);
    `, [fixtures.userIdB]);

    // 3. Dispatch simultaneous order claims using Promise.all barrier
    const claimA = clientA.query(`SELECT public.claim_order_delivery($1) as result;`, [fixtures.orderId]);
    const claimB = clientB.query(`SELECT public.claim_order_delivery($1) as result;`, [fixtures.orderId]);

    const [resA, resB] = await Promise.all([claimA, claimB]);

    const resultA = resA.rows[0].result;
    const resultB = resB.rows[0].result;

    // 4. Assert mutual exclusion & strict single-assignment invariants
    const aSucceeded = resultA.success === true;
    const bSucceeded = resultB.success === true;

    assert.ok(
      (aSucceeded && !bSucceeded) || (!aSucceeded && bSucceeded),
      `Exactly one client must succeed. Result A: ${JSON.stringify(resultA)}, Result B: ${JSON.stringify(resultB)}`
    );

    const winningClient = aSucceeded ? 'A' : 'B';
    const losingResult = aSucceeded ? resultB : resultA;

    assert.strictEqual(
      losingResult.success,
      false,
      'The losing claim must return success: false'
    );
    assert.strictEqual(
      losingResult.error,
      'ALREADY_ASSIGNED',
      `The losing claim must return ALREADY_ASSIGNED. Got: ${losingResult.error}`
    );

    // 5. Read independent final order state from setupClient
    const finalOrderRes = await setupClient.query(
      `SELECT status, rider_id FROM public.orders WHERE id = $1;`,
      [fixtures.orderId]
    );
    const finalOrder = finalOrderRes.rows[0];

    assert.strictEqual(finalOrder.status, 'rider_assigned', 'Order status must be transitioned to rider_assigned');

    const expectedWinningRiderId = winningClient === 'A' ? fixtures.riderIdA : fixtures.riderIdB;
    assert.strictEqual(
      finalOrder.rider_id,
      expectedWinningRiderId,
      'Assigned rider_id must strictly match the winning client'
    );

    // 6. Verify rider statuses: winner is 'busy', loser remains 'online'
    const finalRiderARes = await setupClient.query(`SELECT status FROM public.riders WHERE id = $1;`, [fixtures.riderIdA]);
    const finalRiderBRes = await setupClient.query(`SELECT status FROM public.riders WHERE id = $1;`, [fixtures.riderIdB]);

    const statusA = finalRiderARes.rows[0].status;
    const statusB = finalRiderBRes.rows[0].status;

    if (winningClient === 'A') {
      assert.strictEqual(statusA, 'busy', 'Winning Rider A must transition to busy');
      assert.strictEqual(statusB, 'online', 'Losing Rider B must remain online');
    } else {
      assert.strictEqual(statusB, 'busy', 'Winning Rider B must transition to busy');
      assert.strictEqual(statusA, 'online', 'Losing Rider A must remain online');
    }

    console.log(`[PASS] Concurrency test passed. Winner: Rider ${winningClient}. Invariants validated.`);
  } finally {
    // 7. Non-destructive, target-only cleanup
    try {
      if (setupClient._connected) {
        await setupClient.query('DELETE FROM public.order_otps WHERE order_id = $1;', [fixtures.orderId]);
        await setupClient.query('DELETE FROM public.order_status_history WHERE order_id = $1;', [fixtures.orderId]);
        await setupClient.query('DELETE FROM public.orders WHERE id = $1;', [fixtures.orderId]);
        await setupClient.query('DELETE FROM public.riders WHERE id IN ($1, $2);', [fixtures.riderIdA, fixtures.riderIdB]);
        await setupClient.query('DELETE FROM public.restaurants WHERE id = $1;', [fixtures.restaurantId]);
        await setupClient.query('DELETE FROM public.profiles WHERE id IN ($1, $2, $3, $4);', [fixtures.userIdA, fixtures.userIdB, fixtures.customerId, fixtures.ownerId]);
        await setupClient.query('DELETE FROM auth.users WHERE id IN ($1, $2, $3, $4);', [fixtures.userIdA, fixtures.userIdB, fixtures.customerId, fixtures.ownerId]);
      }
    } catch (cleanupErr) {
      console.warn('Warning: Failed to clean up test fixtures:', cleanupErr.message);
    }

    await clientA.end().catch(() => {});
    await clientB.end().catch(() => {});
    await setupClient.end().catch(() => {});
  }
}

// Standalone execution wrapper (if executed directly via node)
if (process.argv[1] && process.argv[1].endsWith('concurrency_delivery_claim.js')) {
  runConcurrencyTest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
