'use strict';

const express = require("express")
const router = express.Router()


const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../../test-application/javascript/CAUtil.js');
const { buildCCPOrg4, buildWallet } = require('../../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel2';
const chaincodeName = 'order';
const mspOrg4 = 'Org4MSP';
const walletPath = path.join(__dirname, 'wallet');
const org4UserId = 'org4User';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

router.get("/order/getAll", async function (req, res){
	try {
		const ccp = buildCCPOrg4();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org4.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg4);
		await registerAndEnrollUser(caClient, wallet, mspOrg4, org4UserId, 'org4.department1');
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
			wallet,
			identity: org4UserId,
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

router.get("/order/acceptShipment", async function (req, res){
	try {
		const id = req.query.id;
		const ccp = buildCCPOrg4();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org4.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg4);
		await registerAndEnrollUser(caClient, wallet, mspOrg4, org4UserId, 'org4.department1');
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org4UserId,
				discovery: { enabled: true, asLocalhost: true } 
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			// GET ALL ORDERS
			try {
				let result = await contract.evaluateTransaction('readOrder');
                
                await contract.submitTransaction("UpdateOrder", result.ID, result.Name, result.Type,result.Contains,result.Issuer, result.Owner,"Shipping", result.transferTo);
				res.send("Update Order Sucessfully");
                const resul
			} catch (createError) {
				res.send("Caught the error: \n ${createError}");
            }
			res.send(prettyJSONString(result.toString()));

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

router.get("/order/changeShipmentStatus", async function (req, res){
	try {
    const id = req.query.id;
    const status = req.query.status;
		const ccp = buildCCPOrg4();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org4.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg4);
		await registerAndEnrollUser(caClient, wallet, mspOrg4, org4UserId, 'org4.department1');
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org4UserId,
				discovery: { enabled: true, asLocalhost: true } 
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			// GET ALL ORDERS
			try {
				let result = await contract.evaluateTransaction('readOrder');
                
                await contract.submitTransaction("UpdateOrder", result.ID, result.Name, result.Type,result.Contains,result.Issuer, result.Owner,status, result.transferTo);
				res.send("Update Order Sucessfully");
                const resul
			} catch (createError) {
				res.send("Caught the error: \n ${createError}");
            }
			res.send(prettyJSONString(result.toString()));

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})