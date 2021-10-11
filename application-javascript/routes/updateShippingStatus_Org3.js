'use strict';

const express = require("express")
const router = express.Router()


const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../../test-application/javascript/CAUtil.js');
const { buildCCPOrg3, buildWallet } = require('../../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel2';
const chaincodeName = 'updateShippingStatus';
const mspOrg3 = 'Org3MSP';
const walletPath = path.join(__dirname, 'wallet');
const org3UserId = 'org3User';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

router.get("/", async function (req, res){
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

			//Update existed asset
			console.log('\n--> Submit Transaction: UpdateAsset O2, change the shippingStatus to Delivering');
			await contract.submitTransaction('UpdateAsset', 'O2', 'Order2', 'Order', ['P3','P2'], 'Org2', 'Org2', 'Delivering', ' ');
			console.log('*** Result: committed');

			//Throw an error when update non-existed asset
			try {
				console.log('\n--> Submit Transaction: UpdateAsset O23, O23 does not exist and should return an error');
				await contract.submitTransaction('UpdateAsset', 'O23', 'Order2', 'Order', ['P3','P2'], 'Org2', 'Org2', 'Delivering', ' ');
				console.log('******** FAILED to return an error');
			} catch (error) {
				console.log(`*** Successfully caught the error: \n ${error}`);
			}
		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

module.exports = router