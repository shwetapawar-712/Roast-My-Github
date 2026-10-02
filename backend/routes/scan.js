const express = require('express');
const router = express.Router();
const store = require('../store');

router.get('/scan/:username', (req, res) => {
  const { username } = req.params;
  if (!username) {
    return res.status(400).json({ error: 'INVALID_USERNAME', message: 'Username parameter is required.' });
  }

  const cached = store.get(username);
  if (!cached || !cached.result) {
    return res.status(404).json({
      error: 'SCAN_NOT_FOUND',
      message: `No cached scan found for @${username}. Please run a scan first.`
    });
  }

  return res.json({
    ...cached.result,
    isCached: true,
    cachedAt: cached.timestamp
  });
});

module.exports = router;
