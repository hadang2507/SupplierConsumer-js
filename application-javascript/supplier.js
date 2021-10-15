'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg2, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel2';
const chaincodeName = 'product';

const mspOrg2 = 'Org2MSP';
const walletPath = path.join(__dirname, 'wallet2');
const org2UserId = 'org2User';

const express = require("express")
const router = express.Router()

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

router.get("/product/create", async function (req, res){
	//Check if Ingredient exists
	try {
		const id = req.query.pid
    const madeOf = req.query.pmadeof;
		const str = madeOf.toString();
		const madeOfStr = str.split(",");		

		const ccp = buildCCPOrg2();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg2);
		await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org2UserId,
				discovery: { enabled: true, asLocalhost: true } 
			});
			const network = await gateway.getNetwork('mychannel1');
			const contract = network.getContract('ingredient');

			// CREATE PRODUCT
			try {
				for(const value of madeOfStr){
					let result = await contract.evaluateTransaction('IngredientExists', value);
					if(result == 'false'){
						// console.log(result);
						// console.log(value)
						res.send('Ingredient to make Product ' + id + ' does not exist');
						return;
					}
				}
			} catch (createError) {
				res.send("Caught the error" + createError);
			}
		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}

	//CREATE PRODUCT AFTER CHECKING INGREDIENT
	try {
		const id = req.query.pid;
		const name = req.query.pname;
		const type = req.query.ptype;
    const madeOf = req.query.pmadeof;
		const issuer = req.query.pissuer;
    const owner = req.query.powner;

		const ccp = buildCCPOrg2();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg2);
		await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org2UserId,
				discovery: { enabled: true, asLocalhost: true } 
			});
			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			// CREATE PRODUCT
			try {
					//Function for Org2 to add new Product
					//console.log('\n--> Submit Transaction: CreateProduct, creates new asset with id, Name, Type, madeOf, Issuer, Owner arguments');
					//console.log(madeOf)
					await contract.submitTransaction('CreateProduct', id, name, type, madeOf, issuer, owner);
					res.send("Product " + id + " added succesfully");
			} catch (createError) {
				res.send("Caught the error" + createError);
			}
		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

router.get("/product/update", async function (req, res){
	try {
		const id = req.query.pid;
		const name = req.query.pname;
		const madeof = req.query.pmadeof;
		

		const ccp = buildCCPOrg2();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg2);
		await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org2UserId,
				discovery: { enabled: true, asLocalhost: true } 
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			// UPDATE PRODUCT
			try {
				await contract.submitTransaction('UpdateProduct', id, name, "product", madeof, "Org2", "Org2");
				res.send("Update Product " + id + " successfully")

			} catch (updateError) {
				res.send("Caught the error " + updateError);
			}
		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

router.get("/product/getAll", async function (req, res){
	try {
		const ccp = buildCCPOrg2();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg2);
		await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org2UserId,
				discovery: { enabled: true, asLocalhost: true } 
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			// GET ALL PRODUCT
			let result = await contract.evaluateTransaction('GetAllProducts');
			res.send(prettyJSONString(result.toString()));

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

router.get("/ingredient/getAll", async function (req, res){
	try {
		const ccp = buildCCPOrg2();

		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');

		const wallet = await buildWallet(Wallets, walletPath);

		await enrollAdmin(caClient, wallet, mspOrg2);

		await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');

		const gateway = new Gateway();

		try {

			await gateway.connect(ccp, {
				wallet,
				identity: org2UserId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			const network = await gateway.getNetwork('mychannel1');

			const contract = network.getContract('ingredient');
			//Function to get all ingredients
			console.log('\n--> Evaluate Transaction: GetAllIngredients, function returns all the current ingredients on the ledger');
			let result = await contract.evaluateTransaction('GetAllIngredients');
			res.send(prettyJSONString(result.toString()));

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

router.get("/product/delete", async function(req, res){
	try {
		const id = req.query.iid

		const ccp = buildCCPOrg2();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg2);
		await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org2UserId,
				discovery: { enabled: true, asLocalhost: true }
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);
		
			// DELETE INGREDIENT
			await contract.evaluateTransaction('DeleteProduct', id);
			res.send("Delete Successfully");

		} finally {
			gateway.disconnect();
		}

	} catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
})

router.get("/order/getShipping", async function(req, res){
  try {
		const ccp = buildCCPOrg2();

		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');

		const wallet = await buildWallet(Wallets, walletPath);

		await enrollAdmin(caClient, wallet, mspOrg2);

		await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');

		const gateway = new Gateway();

		try {

			await gateway.connect(ccp, {
				wallet,
				identity: org2UserId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			const network = await gateway.getNetwork(channelName);

			const contract = network.getContract('order');
			//Function to get Orders in Shipping
      //await contract.submitTransaction('CreateOrder', 'O7', 'Order7', 'Order', '[P1, P3, P5]', 'Retailer', 'Supplier', 'Shipping','Retailer');
			let result = await contract.evaluateTransaction('QueryOrdersByShippingStatus', 'Shipping');
			res.send(prettyJSONString(result.toString()));

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
router.get("/order/getRequested", async function(req, res){
  try {
		const ccp = buildCCPOrg2();

		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');

		const wallet = await buildWallet(Wallets, walletPath);

		await enrollAdmin(caClient, wallet, mspOrg2);

		await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');

		const gateway = new Gateway();

		try {

			await gateway.connect(ccp, {
				wallet,
				identity: org2UserId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			const network = await gateway.getNetwork(channelName);

			const contract = network.getContract('order');
			//Function to get Orders in Shipping
      //await contract.submitTransaction('CreateOrder', 'O7', 'Order7', 'Order', '[P1, P3, P5]', 'Retailer', 'Supplier', 'Shipping','Retailer');
			let result = await contract.evaluateTransaction('QueryOrdersByShippingStatus', 'Requested');
			res.send(prettyJSONString(result.toString()));

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
router.get("/order/getShipped", async function(req, res){
  try {
		const ccp = buildCCPOrg2();

		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');

		const wallet = await buildWallet(Wallets, walletPath);

		await enrollAdmin(caClient, wallet, mspOrg2);

		await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');

		const gateway = new Gateway();

		try {

			await gateway.connect(ccp, {
				wallet,
				identity: org2UserId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			const network = await gateway.getNetwork(channelName);

			const contract = network.getContract('order');
			//Function to get Orders in Shipping
      //await contract.submitTransaction('CreateOrder', 'O7', 'Order7', 'Order', '[P1, P3, P5]', 'Retailer', 'Supplier', 'Shipping','Retailer');
			let result = await contract.evaluateTransaction('QueryOrdersByShippingStatus', 'Shipped');
			res.send(prettyJSONString(result.toString()));

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})


module.exports = router