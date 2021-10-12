/* Function to check if Ingredient exists for Organization 2 (Supplier)

   Creator: Nguyen Phan Yen Ngan

   Day created: 11/10/2021

*/


'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg2, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel2';
const chaincodeName = 'IngredientExists';
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

			//Initialize a set of data
			console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of ingredients on the ledger');
			await contract.submitTransaction('InitLedger');
			console.log('*** Result: committed');

			//Function to check if an ingredient exists, return true if yes
			console.log('\n--> Evaluate Transaction: IngredientExists, function returns "true" if an ingredient with given ID exist');
			result = await contract.evaluateTransaction('IngredientExists', 'I1');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

module.exports = router
