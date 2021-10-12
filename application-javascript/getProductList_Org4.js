/* Function to get list of Products for Organization 4 (Retailer)

   Creator: Nguyen Phan Yen Ngan

   Day created: 11/10/2021

*/


'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg4, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel2';
const chaincodeName = 'getAllProducts';
const mspOrg4 = 'Org4MSP';
const walletPath = path.join(__dirname, 'wallet');
const org4UserId = 'org4User';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}


router.get("/", async function (req, res){
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

			//Initialized a set of data
			console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of products on the ledger');
			await contract.submitTransaction('InitLedger');
			console.log('*** Result: committed');

			//Function to get list of current products
			console.log('\n--> Evaluate Transaction: GetAllProducts, function returns all the current products on the ledger');
			result = await contract.evaluateTransaction('GetAllProducts');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);


		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

module.exports = router
