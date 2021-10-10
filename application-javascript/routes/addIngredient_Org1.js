'use strict';

const express = require("express")
const router = express.Router()


const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel1';
const chaincodeName = 'addIngredient';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'org1User';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

router.get("/", async function (req, res){
  try {
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg1);
		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true }
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			//Initialize a set of asset data
			console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');
			await contract.submitTransaction('InitLedger');
			console.log('*** Result: committed');

			//Create new asset
			console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID, Name, Type, Issuer arguments');
			result = await contract.submitTransaction('CreateAsset', 'I23', 'Pineapple', 'ingredient','Org1');
			console.log('*** Result: committed');
			if (`${result}` !== '') {
				console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			}

			//Read asset with given ID
			console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given ID');
			result = await contract.evaluateTransaction('ReadAsset', 'I2');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

			//Delete asset with given ID
			console.log('\n--> Evaluate Transaction: DeleteAsset, function returns an asset with a given ID');
			result = await contract.evaluateTransaction('DeleteAsset', 'I5');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

			//Check for existed asset
			console.log('\n--> Evaluate Transaction: AssetExists, function returns "true" if an asset with given assetID exist');
			result = await contract.evaluateTransaction('AssetExists', 'asset1');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

			//Update existed asset
			console.log('\n--> Submit Transaction: UpdateAsset I3, change the Issuer to Org2');
			await contract.submitTransaction('UpdateAsset', 'I3', 'Orange', 'ingredient', 'Org2');
			console.log('*** Result: committed');

			//Throw an error when update non-existed asset
			try {
				console.log('\n--> Submit Transaction: UpdateAsset I50, I50 does not exist and should return an error');
				await contract.submitTransaction('UpdateAsset', 'I50', 'Orange', 'ingredient', 'Org2');
				console.log('******** FAILED to return an error');
			} catch (error) {
				console.log(`*** Successfully caught the error: \n ${error}`);
			}
		
			//Return all asset data
			console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');
			let result = await contract.evaluateTransaction('GetAllAssets');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

module.exports = router