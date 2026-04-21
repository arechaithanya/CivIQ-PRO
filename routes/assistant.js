const express = require('express');
const { getElectionGuidance } = require('../utils/decisionEngine');

const router = express.Router();

router.post('/assist', async (req, res, next) => {
  try {
    const { age, hasVoterID, movedCity } = req.body;

    if (
      !Number.isFinite(age) ||
      !Number.isInteger(age) ||
      age < 0 ||
      age > 150 ||
      typeof hasVoterID !== 'boolean' ||
      typeof movedCity !== 'boolean'
    ) {
      return res.status(400).json({
        error: 'Invalid request body',
        message: 'age must be a non-negative number, and hasVoterID/movedCity must be boolean values.'
      });
    }

    const result = getElectionGuidance({ age, hasVoterID, movedCity });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
