# company-info
A service for querying various bits of info about companies

Required:

pm2 to be installed globally

npm install
createdb company-info
node populate.js config.json
pm2 start server.js --name company_info -x -- config.json
npm test
