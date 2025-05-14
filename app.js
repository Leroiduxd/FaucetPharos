const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({ message: '✅ API is working fine!' });
});

app.post('/echo', (req, res) => {
  res.json({ received: req.body });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
