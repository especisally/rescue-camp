const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`Admin panel: http://localhost:${config.port}/admin`);
  console.log(`API base: http://localhost:${config.port}/api`);
});
