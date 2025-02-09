import knex from 'knex';
import { env } from 'node:process';

export default knex({
    client: 'pg',
    connection: `postgres://${env.database_username}:${env.database_password}@${env.database_host}:${env.database_port}/${env.database_name}`
});