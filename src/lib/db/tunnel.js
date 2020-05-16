// Copyright (c) 2015 The SQLECTRON Team

import fs from 'fs'
import path from 'path'
import { getPort } from '../utils';
import createLogger from '../logger';
import { SSHConnection } from 'node-ssh-forward'

import { resolveHomePathToAbsolute } from '../utils'

const logger = createLogger('db:tunnel');

export default function(config) {
  logger().debug('setting up ssh tunnel')

  return new Promise(async (resolve, reject) => {
    try {
      const connection = new SSHConnection({
        endHost: config.ssh.host,
        endPort: config.ssh.port,
        bastionHost: config.ssh.bastionHost,
        agentForward: config.ssh.agentForward,
        privateKey: fs.readFileSync(path.resolve(resolveHomePathToAbsolute(config.ssh.privateKey))),
        passphrase: config.ssh.passphrase,
        username: config.ssh.user,
        password: config.ssh.password
      })
      logger().debug("connection created!")

      const localPort = await getPort()
      const tunnelConfig = {
        fromPort: localPort,
        toPort: config.port,
        toHost: config.host
      }
      const tunnel = await connection.forward(tunnelConfig)
      logger().debug('tunnel created!')
      const result = {
        connection: connection,
        localHost: '127.0.0.1',
        localPort: localPort,
        tunnel: tunnel
      }
      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}
