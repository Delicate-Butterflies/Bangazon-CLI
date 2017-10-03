'use strict';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/bangazon.sqlite');

module.exports.dbGetAllProducts = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM products`, (err, productdata) => {
      if (err) return reject(err);
      resolve(productdata);
    });
  });
};

module.exports.dbGetSingleProduct = id => {
  // TODO check that there is still inventory available
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM products
            WHERE id = ${id}`,
      (err, productdata) => {
        if (err) return reject(err);
        resolve(productdata);
      }
    );
  });
};

module.exports.dbGetSingleProductWithDetails = id => {
  // TODO check that there is still inventory available
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM products
            WHERE id = ${id}`,
      (err, productdata) => {
        if (err) return reject(err);
        resolve(productdata);
      }
    );
  });
};

module.exports.dbPostProduct = newProduct => {
  return new Promise((resolve, reject) => {
    let { product_type_id, price, title, description, original_quantity, seller_user_id, created_on } = newProduct;
    db.run(
      `INSERT INTO products(product_type_id, price, title, description, original_quantity, seller_user_id, created_on)
      VALUES('${product_type_id}', '${price}', '${title}', '${description}', '${original_quantity}', '${seller_user_id}', '${created_on}')`,
      function(err) {
        if (err) return reject(err);
        resolve({ message: 'new product', id: this.lastID });
      }
    );
  });
};

module.exports.dbDeleteProduct = id => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM products WHERE id = ${id}`, function(err) {
      if (err) return reject(err);
      resolve({ message: 'product deleted', id: this.lastID });
    });
  });
};

module.exports.dbPutProduct = (productObj, product_id) => {
  return new Promise((resolve, reject) => {
    let query = `UPDATE products SET `;
    let keys = Object.keys(productObj);
    keys.forEach(key => {
      query += `"${key}" = "${productObj[key]}",`;
    });
    query = query.slice(0, -1);
    query += ` WHERE id = ${product_id}`;
    db.run(query, function(err) {
      if (err) return reject(err);
      resolve({ message: 'product updated', rows_updated: this.changes });
    });
  });
};

module.exports.dbGetStaleProductsByCriteriaTwo = userId => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT DISTINCT products.title FROM ordersProducts, products
      WHERE products.id = ordersProducts.product_id
      AND products.seller_user_id = ${userId}`,
      (err, productData) => {
        if (err) return reject(err);
        resolve(productData);
      }
    );
  });
};
module.exports.dbCheckForProductSales = product_id => {
  // takes product id, returns number of product sold(data.sold) and original_quantity (data.original_quantity)
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT count(op.product_id) as sold, p.original_quantity
			FROM products p, orders o, ordersProducts op
			WHERE  p.id = ${product_id}
			AND p.id = op.product_id
			AND op.order_id = o.id
			AND o.payment_type_id != 'null'`,
      (err, data) => {
        if (err) return reject(err);
        resolve(data);
      }
    );
  });
};

module.exports.removeProductFromOpenOrders = () => {};

module.exports.dbGetAllProductsByUser = userId => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM products WHERE seller_user_id = ${userId}`, (err, productdata) => {
      if (err) return reject(err);
      resolve(productdata);
    });
  });
};

module.exports.dbGetAllStaleProducts = () => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT DISTINCT p.id, p.title
    FROM products p, ordersProducts o
    WHERE p.id <> o.product_id
    and p.created_on NOT BETWEEN strftime('%Y-%m-%d', date('now', '-180 day') ) AND strftime('%Y-%m-%d', date('now') )
    union
    SELECT DISTINCT p.id, p.title
    FROM products p, ordersProducts op, orders o
    WHERE p.id = op.product_id
    AND  op.order_id = o.id
    AND o.payment_type_id = "null"
    AND o.order_date NOT BETWEEN strftime('%Y-%m-%d', date('now', '-90 day') ) AND strftime('%Y-%m-%d', date('now') )
    union
    SELECT DISTINCT p.id, p.title
    FROM products p, ordersProducts op, orders o
    WHERE p.id = op.product_id
    AND  op.order_id = o.id
    AND o.payment_type_id IS NOT "null"
    AND p.original_quantity -
    (SELECT COUNT(op.product_id)
    FROM ordersProducts op
    GROUP BY op.product_id) > 0
    and p.created_on NOT BETWEEN strftime('%Y-%m-%d', date('now', '-180 day') ) AND strftime('%Y-%m-%d', date('now') )`,
      (err, allStaleProducts) => {
        if (err) return reject(err);
        resolve(allStaleProducts);
      }
    );
  });
};

module.exports.dbGetUsersStaleProducts = userId => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT DISTINCT p.id, p.title
    FROM products p, ordersProducts o
    WHERE p.id <> o.product_id
    and p.created_on NOT BETWEEN strftime('%Y-%m-%d', date('now', '-180 day') ) AND strftime('%Y-%m-%d', date('now') )
    and p.seller_user_id = ${userId}
    union
    SELECT DISTINCT p.id, p.title
    FROM products p, ordersProducts op, orders o
    WHERE p.id = op.product_id
    AND  op.order_id = o.id
    AND o.payment_type_id = "null"
    AND o.order_date NOT BETWEEN strftime('%Y-%m-%d', date('now', '-90 day') ) AND strftime('%Y-%m-%d', date('now') )
    and p.seller_user_id = ${userId}
    union
    SELECT DISTINCT p.id, p.title
    FROM products p, ordersProducts op, orders o
    WHERE p.id = op.product_id
    AND  op.order_id = o.id
    AND o.payment_type_id IS NOT "null"
    AND p.original_quantity -
    (SELECT COUNT(op.product_id)
    FROM ordersProducts op
    GROUP BY op.product_id) > 0
    and p.created_on NOT BETWEEN strftime('%Y-%m-%d', date('now', '-180 day') ) AND strftime('%Y-%m-%d', date('now') )
    and p.seller_user_id = ${userId}`,
      (err, userStaleProducts) => {
        if (err) return reject(err);
        resolve(userStaleProducts);
      }
    );
  });
};

/*
	TODO - db currently has no products that have not sold, according to following query:
	SELECT count(op.product_id) as sold, p.original_quantity
	FROM products p, orders o, ordersProducts op
	WHERE p.id = op.product_id
	AND op.order_id = o.id
	AND o.payment_type_id != 'null'
	GROUP BY p.id
	having count(p.id = op.product_id) = 0
*/

/*
  dbDeleteRemainingProductQuantity
  ARGS: product_id (from product table)
  takes a product id, removes the remaining quantity
  TODO: db product has original quantity, not quantity remaining.
  new property? other way to display remaining after sales?
*/
// module.exports.dbDeleteRemainingProductQuantity = product_id => {};
