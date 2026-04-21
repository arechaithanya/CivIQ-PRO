const express = require('express');
const assistantRouter = require('./routes/assistant');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/', assistantRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'VoteNavigator' });
});

app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong. Please try again.'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`VoteNavigator API running on port ${PORT}`);
  });
}

module.exports = app;
