import mysql from 'mysql';
import { kmsDecrypt } from 'lib/utilities';

const connection = null;

export default class Connection {
  constructor() {
    this.connection = null;
  }
  connect() {
    const promise = new Promise((resolve, reject) => {
      kmsDecrypt({ username: process.env.db_user, password: process.env.db_pass })
        .then((decrypted) => {
          this.connection = mysql.createConnection({
            host: process.env.db_host,
            user: decrypted.username,
            password: decrypted.password,
            database: process.env.db_select,
          });
          this.connection.connect(err => {
            if (err) {
              reject(err);
              return;
            }
            resolve(this);
            console.log(`connected as id ${this.connection.threadId}`);
          });
        });
    });
    return promise;
  }

  query(sql) {
    const promise = new Promise((resolve, reject) => {
      this.connection.query(sql, (error, results, fields) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(results);
      });
    });
    return promise;
  }

  close() {
    this.connection.end();
  }
}
