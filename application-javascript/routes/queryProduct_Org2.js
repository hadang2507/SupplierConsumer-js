'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg2, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel2';
const chaincodeName = 'queryProduct';
const mspOrg2 = 'Org2MSP';
const walletPath = path.join(__dirname, 'wallet');
const org2UserId = 'org2User';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

router.get("/", async function (req, res){
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


			console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of products on the ledger');
			await contract.submitTransaction('InitLedger');
			console.log('*** Result: committed');
			

			console.log('\n--> Evaluate Transaction: ReadProduct, function returns a product with a given assetID');
			result = await contract.evaluateTransaction('ReadProduct', 'I3');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);


		} finally {

			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}

})

module.exports = router