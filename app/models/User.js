'use strict';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/bangazon.sqlite');

module.exports.dbGetAllUsers = () => {
	return new Promise((resolve, reject) => {
		db.all(`SELECT * FROM users`, (err, userData) => {
			if (err) return reject(err);
			resolve(userData);
		});
	});
};

module.exports.dbGetOneUser = id => {
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT * FROM users
      WHERE id = ${id}`,
			(err, userData) => {
				if (err) return reject(err);
				resolve(userData);
			}
		);
	});
};

module.exports.dbPostUser = user => {
	return new Promise((resolve, reject) => {
		let current_date = new Date().toISOString();
		db.run(
			`INSERT INTO users
      (first_name, last_name, account_created_date, last_login_date, street_address, city_address, state_code, zip_code)
      VALUES('${user.first_name}', '${user.last_name}', '${current_date}', '${current_date}', '${user.street_address}',  '${user.city_address}', '${user.state_code}', '${user.zip_code}')`,
			function(err) {
				if (err) return reject(err);
				resolve({ message: 'new user', id: this.lastID });
			}
		);
	});
};

module.exports.dbPutUser = (req, user_id) => {
	let user = req.body;
	return new Promise((resolve, reject) => {
		let query = `UPDATE users SET `;
		let keys = Object.keys(user);
		keys.forEach(key => {
			query += `"${key}" = "${user[key]}",`;
		});
		query = query.slice(0, -1);
		query += ` WHERE id = ${user_id}`;
		db.run(query, err => {
			if (err) return reject(err);
			resolve({ message: 'user updated', rows_updated: this.changes });
		});
	});
};

module.exports.dbGetInactiveUsers = () => {
	return new Promise((resolve, reject) => {
		db.all(
			`SELECT * FROM users
      EXCEPT
      SELECT u.* FROM users u
      JOIN orders o ON u.id = o.customer_user_id`,
			(err, inactiveUsersData) => {
				if (err) return reject(err);
				resolve(inactiveUsersData);
			}
		);
	});
};
