const express = require('express');
const app = express();
require('./startup/directory')();
require('./startup/config')(app);
require('./middleware/logger.middleware');
require('./startup/logging')(app);
require('./startup/validation')();
require('./startup/db')();
require('./startup/routes')(app);
require('./startup/swagger')(app);

const port = process.env.BACKEND_PORT || 5001;
app.listen(port, () => { console.log(`Listening on port ${port}...`) });