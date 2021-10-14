'use strict';

const express = require("express")
const router = express.Router()


const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../../test-application/javascript/CAUtil.js');
const { buildCCPOrg3, buildWallet } = require('../../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel2';
const chaincodeName = 'order';
const mspOrg3 = 'Org3MSP';
const walletPath = path.join(__dirname, 'wallet');
const org3UserId = 'org3User';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

//View All Orders
router.get("/getAll", async function (req, res){
	try {
		const ccp = buildCCPOrg3();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org3.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg3);
		await registerAndEnrollUser(caClient, wallet, mspOrg3, org3UserId, 'org3.department1');
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org3UserId,
				discovery: { enabled: true, asLocalhost: true } 
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			// GET ALL ORDERS
			let result = await contract.evaluateTransaction('GetAllOrders');
			res.send(prettyJSONString(result.toString()));

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

//Accept Shipping Order

router.get("/update", async function (req, res){
	try {
		const id = req.query.iid;
		const name = req.query.iname;
		const type = req.query.itype;
		const madeof = req.query.imadeof;
		const issuer = req.query.iissuer;
		const owner = req.query.iowner;

		const ccp = buildCCPOrg3();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org3.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg3);
		await registerAndEnrollUser(caClient, wallet, mspOrg3, org3UserId, 'org3.department1');
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org3UserId,
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
				console.log('\n--> Submit Transaction: UpdateOrder, update an order with id, Name, Type, Contains, Issuer, Owner, shippingStatus, transferTo arguments');
				result = await contract.submitTransaction('UpdateOrder', id, name, type, contains, issuer, owner, shippingstatus, transferto);
				console.log('*** Result: committed');
				if (`${result}` !== '') {
					console.log(`*** Result: ${prettyJSONString(result.toString())}`);
				}
			} catch (updateError) {
				res.send("Caught the error: \n ${updateError}");
			}

            console.log('\n--> Evaluate Transaction: GetAllOrders, function returns all the current orders on the ledger');
			let result = await contract.evaluateTransaction('GetAllOrders');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
