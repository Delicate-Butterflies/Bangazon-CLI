'use strict';
/* eslint-disable no-console */

// 3rd party libs
const { red, magenta, blue } = require('chalk');
const prompt = require('prompt');
const colors = require('colors/safe');
prompt.message = colors.blue('Bangazon Corp');

// app modules
const { promptPrintUsers } = require('./controllers/active-user-ctrl');
const { setActiveCustomer, getActiveCustomer } = require('./activeCustomer');
const { promptAddPayment, addPaymentType } = require('./controllers/add-payment-type-ctrl');
const { promptNewUser } = require('./controllers/user-ctrl');
const { promptNewProduct } = require('./controllers/user-add-product-ctrl');
const { sellerRevenueReport } = require('./controllers/user-revenue-ctrl');

prompt.start();

let mainMenuHandler = (err, userInput) => {
	// This could get messy quickly. Maybe a better way to parse the input?
	switch (userInput.choice) {
		case '1':
			promptNewUser().then(() => {
				// saves customer to db
				module.exports.displayWelcome();
			});
			break;
		case '2':
			promptPrintUsers().then(userData => {
				setActiveCustomer(userData.activeUser);
				module.exports.displayWelcome();
			});
			break;
		case '3':
			if (getActiveCustomer() == null) {
				console.log(`${red('>> No active user. Please select option 2 and select active customer <<')}`);
				module.exports.displayWelcome();
			} else {
				promptAddPayment().then(custData => {
					let activeUser = getActiveCustomer();
					let userObj = {
						customer_user_id: activeUser,
						type: custData.paymentType,
						account_number: custData.accountNumber
					};
					addPaymentType(userObj).then(() => {
						module.exports.displayWelcome();
					});
				});
			}
			break;
		case '4':
			console.log();
			promptNewProduct().then(() => {
				console.log();
				console.log(`Your product was added!\n`);
				module.exports.displayWelcome();
			});
			break;
		case '10':
			sellerRevenueReport(getActiveCustomer())
				.then(data => {
					console.log(data);
					module.exports.displayWelcome();
				})
				.catch(err => {
					console.log(err);
					module.exports.displayWelcome();
				});
			break;
		case '12':
			console.log(`Goodbye!`);
			process.exit();
			break;
		default:
			console.log('no such option');
			module.exports.displayWelcome();
			break;
	}
};

module.exports.displayWelcome = () => {
	let headerDivider = `${magenta('*********************************************************')}`;
	return new Promise((resolve, reject) => {
		console.log(`
  ${headerDivider}
  ${magenta('**  Welcome to Bangazon! Command Line Ordering System  **')}
  ${headerDivider}
  ${magenta('1.')} Create a customer account
  ${magenta('2.')} Choose active customer
  ${magenta('3.')} Create a payment option
  ${magenta('4.')} Add product to shopping cart
  ${magenta('5.')} Complete an order
  ${magenta('6.')} See product popularity
  ${magenta('10.')} Show customer revenue report
  ${magenta('12.')} Leave Bangazon!\n`);
		prompt.get(
			[
				{
					name: 'choice',
					description: 'Please make a selection'
				}
			],
			mainMenuHandler
		);
	});
};
