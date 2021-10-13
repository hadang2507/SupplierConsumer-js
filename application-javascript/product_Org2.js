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


router.get("/create", async function (req, res){
	try {
		const id = req.query.iid;
		const name = req.query.iname;
		const type = req.query.itype;
        const madeOf = req.query.imadeof;
		const issuer = req.query.iissuer;
        const owner = req.query.iowner;

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

			//Initialize a set of data
			console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of products on the ledger');
			await contract.submitTransaction('InitLedger');
			console.log('*** Result: committed');

			// CREATE PRODUCT
			try {
				if (!(await contract.submitTransaction("ProductExist", id))) {
					//Function for Org2 to add new Product
					console.log('\n--> Submit Transaction: CreateProduct, creates new asset with id, Name, Type, madeOf, Issuer, Owner arguments');
					result = await contract.submitTransaction('CreateProduct', id, name, type, madeOf, issuer, owner);
					console.log('*** Result: committed');
				} else {
					res.send("Product has already added to the world state")
				}

				if (`${result}` !== '') {
					console.log(`*** Result: ${prettyJSONString(result.toString())}`);
				}
			} catch (createError) {
				res.send("Caught the error: \n ${createError}");
			}

			//Function to check
			console.log('\n--> Evaluate Transaction: GetAllProducts, function returns all the current products on the ledger');
			let result = await contract.evaluateTransaction('GetAllProducts');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

router.get("/update", async function (req, res){
	try {
		const id = req.query.iid;
		const name = req.query.iname;
		const type = req.query.itype;
		const madeof = req.query.imadeof;
		const issuer = req.query.iissuer;
		const owner = req.query.iowner;

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

			// INITIALIZE DATA
			console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');
			await contract.submitTransaction('InitLedger');
			console.log('*** Result: committed');

			// UPDATE PRODUCT
			try {
				console.log('\n--> Submit Transaction: UpdateProduct, update a product with id, Name, Type, madeOf, Issuer, Owner arguments');
				result = await contract.submitTransaction('UpdateProduct', id, name, type, madeof, issuer, owner);
				console.log('*** Result: committed');
				if (`${result}` !== '') {
					console.log(`*** Result: ${prettyJSONString(result.toString())}`);
				}
			} catch (updateError) {
				res.send("Caught the error: \n ${updateError}");
			}

            console.log('\n--> Evaluate Transaction: GetAllProducts, function returns all the current products on the ledger');
			let result = await contract.evaluateTransaction('GetAllProducts');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

router.get("/getAll", async function (req, res){
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

router.get("/delete", async function(req, res){
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


module.exports = router