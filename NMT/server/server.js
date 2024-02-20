const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('ssh2');

const app = express();
const port = 5010;

app.use(bodyParser.json());

// Store the SSH connection globally
let sshConnection = null;

app.post('/api/connect-ssh', (req, res) => {
  const { hostname, username, password } = req.body;

  // Close existing connection if any
  if (sshConnection) {
    sshConnection.end();
    sshConnection = null;
  }

  const conn = new Client();

  conn.on('ready', () => {
    console.log('SSH Connection Successful');
    // Store the connection globally
    sshConnection = conn;
    res.json({ message: 'SSH Connection Successful', resVal: 1 });
  });

  conn.on('error', (err) => {
    console.error('Error connecting to SSH:', err.message);
    res.status(500).json({ error: `Error connecting to SSH: ${err.message}` });
  });

  conn.connect({
    host: hostname,
    port: 22,
    username: username,
    password: password,
  });
});

app.post('/api/execute-command', (req, res) => {
  const { command } = req.body;

  if (!sshConnection) {
    return res.status(500).json({ error: 'SSH connection not established' });
  }

  sshConnection.exec(command, (err, stream) => {
    if (err) {
      console.error('Error executing command:', err.message);
      return res.status(500).json({ error: `Error executing command: ${err.message}` });
    }

    let output = '';

    stream.on('data', (data) => {
      output += data.toString();
    });

    stream.on('close', (code, signal) => {
      if (code !== 0) {
        console.error(`Command execution failed with code ${code}, signal ${signal}`);
        return res.status(500).json({ error: `Command execution failed with code ${code}, signal ${signal}` });
      }

      console.log('Command execution complete');
      res.json({ message: 'Command execution complete', output, resVal: 1 });
    });
  });
});

app.listen(port, () => {
  console.log('Server Started on port ' + port);
});
