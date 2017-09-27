'use strict';
/* eslint-disable no-console */

const prompt = require('prompt');
const { dbGetAllProductTypes } = require('../models/Product-Type');
const { dbPostProduct } = require('../models/Product');
const { getActiveCustomer } = require('../activeCustomer');

module.exports.promptNewProduct = () => {
  return new Promise((resolve, reject) => {
    console.log('Adding a new product!\n');
    console.log('Product-Types\n');
    dbGetAllProductTypes().then(productTypes => {
      productTypes.forEach((type, typeIndex) => {
        if (typeIndex === productTypes.length - 1) console.log(`Option ${typeIndex + 1}: ${type.name}\n`);
        else console.log(`Option ${typeIndex + 1}: ${type.name}`);
      });
      prompt.get(
        [
          {
            name: 'product_type_id',
            description: 'Select product type from the listed types (by number)',
            type: 'string',
            required: true
          },
          {
            name: 'price',
            description: 'Set unit price',
            type: 'string',
            required: true
          },
          {
            name: 'title',
            description: 'Set product name',
            type: 'string',
            required: true
          },
          {
            name: 'description',
            description: 'Set product description',
            type: 'string',
            required: true
          },
          {
            name: 'original_quantity',
            description: 'How many do you have for sale?',
            type: 'string',
            required: true
          }
        ],
        function(err, results) {
          if (err) return reject(err);
          results.seller_user_id = getActiveCustomer().id;
          dbPostProduct(results).then(prodData => {
            if (err) return reject(err);
            resolve(prodData);
          });
        }
      );
    });
  });
};
