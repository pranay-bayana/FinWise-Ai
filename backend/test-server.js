import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('OK'));
const server = app.listen(5005, '127.0.0.1', () => {
  console.log('Server started on 5005');
  setTimeout(() => server.close(), 2000);
});
