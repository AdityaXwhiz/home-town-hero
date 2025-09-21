// In routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming you have a file to connect to your database

// GET /api/analytics/case-status
router.get('/case-status', async (req, res) => {
  try {
    // This SQL query counts cases and groups them by status
    const query = `SELECT status, COUNT(*) as count FROM cases GROUP BY status;`;
    const { rows } = await db.query(query);

    // Format the data into a simple key-value object
    const statusCounts = {
      pending: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0
    };

    rows.forEach(row => {
        // Map database status names (e.g., 'in_progress') to keys
        if (statusCounts.hasOwnProperty(row.status.toLowerCase().replace(' ', '_'))) {
            statusCounts[row.status.toLowerCase().replace(' ', '_')] = parseInt(row.count, 10);
        }
    });

    res.json(statusCounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add this to routes/analyticsRoutes.js, inside the file but after the previous route

// GET /api/analytics/monthly-trends
router.get('/monthly-trends', async (req, res) => {
  try {
    const monthsToQuery = 6;
    const labels = [];
    const createdData = [];
    const resolvedData = [];
    const today = new Date();

    for (let i = monthsToQuery - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'long' });
      const year = d.getFullYear();
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      labels.push(monthName);

      // Query for created cases in the month
      const createdResult = await db.query(
        `SELECT COUNT(*) FROM cases WHERE "createdAt" >= $1 AND "createdAt" <= $2`,
        [firstDay, lastDay]
      );
      createdData.push(parseInt(createdResult.rows[0].count, 10));

      // Query for resolved cases in the month
      const resolvedResult = await db.query(
        `SELECT COUNT(*) FROM cases WHERE "resolvedAt" >= $1 AND "resolvedAt" <= $2`,
        [firstDay, lastDay]
      );
      resolvedData.push(parseInt(resolvedResult.rows[0].count, 10));
    }

    res.json({
      labels,
      datasets: [
        { label: 'Cases Created', data: createdData },
        { label: 'Cases Resolved', data: resolvedData },
      ],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;