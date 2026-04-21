const express = require('express');
const path = require('path');
const assistantRouter = require('./routes/assistant');

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'VoteNavigator' });
});

app.use(express.json());
app.use('/', assistantRouter);
app.use(express.static(path.join(__dirname)));

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
