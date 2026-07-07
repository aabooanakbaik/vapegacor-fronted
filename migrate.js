import mysql from 'mysql2/promise';

async function migrate() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vapegacor',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Migrating orders table...');
    await pool.query('ALTER TABLE orders CHANGE COLUMN status order_status VARCHAR(50) DEFAULT "pending"');
    await pool.query('ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT "pending"');
    await pool.query('ALTER TABLE orders ADD COLUMN order_number VARCHAR(50)');
    await pool.query('UPDATE orders SET order_number = CONCAT("INV-", SUBSTRING(id, 1, 8)) WHERE order_number IS NULL');
    
    console.log('Done!');
  } catch(e) {
    console.error(e.message);
  } finally {
    await pool.end();
  }
}
migrate();
