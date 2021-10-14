'use strict';

const express = require("express")
const router = express.Router()


const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg3, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel2';
const chaincodeName = 'delivery';
const mspOrg3 = 'Org3MSP';
const walletPath = path.join(__dirname, 'wallet');
const org3UserId = 'org3User';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

//View all orders queried by shipping status ("Delivering", "Delivered", etc.)
router.get("/tracking", async function (req, res){
	try {
		const shippingStatus = req.query.ishippingstatus;

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

router.get("/updateShippingStatus", async function (req, res){
	try {
		const id = req.query.iid;
		const name = req.query.iname;
		const type = req.query.itype;
        const contains = req.query.imadeof;
		const issuer = req.query.iissuer;
        const owner = req.query.iowner;
        const shippingStatus = req.query.ishippingstatus;
        const transferTo = req.query.itransferto;
		  
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
  
			  // UPDATE SHIPPING STATUS
			  try {
				  await contract.submitTransaction('UpdateIngredient', id, name, type, contains, issuer, owner, shippingStatus, transferTo);
				  res.send("Update Sucessfully")
			  } catch (updateError) {
				  res.send("Caught the error: \n ${updateError}");
			  }	
  
		  } finally {
			  gateway.disconnect();
		  }
	  } catch (error) {
		  console.error(`******** FAILED to run the application: ${error}`);
	  }
  })

module.exports = router;