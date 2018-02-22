import Connection from 'lib/connection';

/**
 * getMyResource - connect to our db and do a sql query.
 * @return {Promise} results of query
 */
export const getMyResource = async () => {
  const conn = new Connection();
  const db = await conn.connect();

  const sql = 'select * from some_table';
  const results = await db.query(sql);

  conn.close();
  return results;
};
