'use strict';

const express = require("express")
const router = express.Router()


const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg4, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel2';
const chaincodeName = 'tracking';
const mspOrg4 = 'Org4MSP';
const walletPath = path.join(__dirname, 'wallet');
const org4UserId = 'org4User';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

//View all orders queried by shipping status ("Delivering", "Delivered", etc.)
router.get("/tracking", async function (req, res){
	try {
		const shippingStatus = req.query.ishippingstatus;

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
		
			//Return all asset data query by shipping status
			let result = await contract.evaluateTransaction('QueryOrdersByShippingStatus', shippingStatus);
			res.send(prettyJSONString(result.toString()));

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

module.exports = router;