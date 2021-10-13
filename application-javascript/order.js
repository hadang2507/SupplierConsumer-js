'use strict';

const express = require("express")
const router = express.Router()


const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../../test-application/javascript/CAUtil.js');
const { buildCCPOrg2, buildWallet } = require('../../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel2';
const chaincodeName = 'order';
const mspOrg2 = 'Org2MSP';
const walletPath = path.join(__dirname, 'wallet');
const org2UserId = 'org2User';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

router.get("/create", async function (req, res){
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
            
            // Supplier creates an order for the retailer request
			console.log('\n--> Submit Transaction: CreateOrder, function creates an order the retailer by the supplier');
			await contract.submitTransaction('CreateOrder');
			console.log('*** Result: committed');

            // Supplier tranfers the created order to the retailer
            console.log('\n--> Submit Transaction: TransferOrder, function transfers the order to the supplier');
			await contract.submitTransaction('TransferOrder');
			console.log('*** Result: committed');

        } finally {
            gateway.disconnect();
        }
    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
})
    
module.exports = router  