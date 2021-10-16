'use strict';

const express = require("express")
const router = express.Router()


const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
// const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg4, buildWallet } = require('../../test-application/javascript/AppUtil.js');
const walletPath4 = path.join(__dirname, 'wallet4');

const channelName = 'mychannel2';
const chaincodeName = 'order';
// const mspOrg4 = 'Org4MSP';
// const walletPath = path.join(__dirname, 'wallet5');
// const org4UserId = 'org4User6';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

router.get("/order/getAll", async function (req, res){
	try {
		// const ccp = buildCCPOrg4();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org4.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg4);
		// await registerAndEnrollUser(caClient, wallet, mspOrg4, org4UserId, 'org4.department1');

		const ccp = buildCCPOrg4();
		const wallet =  await Wallets.newFileSystemWallet( walletPath4);
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});
			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			// GET ALL ORDERS
			let resul = await contract.evaluateTransaction('GetAllOrders');
			res.send(prettyJSONString(resul.toString()));

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

		// const ccp = buildCCPOrg4();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org4.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg4);
		// await registerAndEnrollUser(caClient, wallet, mspOrg4, org4UserId, 'org4.department1');

		const ccp = buildCCPOrg4();
		const wallet =  await Wallets.newFileSystemWallet( walletPath4);
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			const resul = JSON.parse(await contract.evaluateTransaction('ReadOrder',id));


            await contract.submitTransaction("UpdateOrder", resul.ID, resul.Name, resul.Type,resul.Contains.join(','),resul.Issuer, resul.Owner,"Shipping", resul.transferTo);
			res.send("Update Order Sucessfully");

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

		// const ccp = buildCCPOrg4();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org4.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg4);
		// await registerAndEnrollUser(caClient, wallet, mspOrg4, org4UserId, 'org4.department1');

		const ccp = buildCCPOrg4();
		const wallet =  await Wallets.newFileSystemWallet( walletPath4);
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);
			const resul = JSON.parse(await contract.evaluateTransaction('ReadOrder',id));
            
            await contract.submitTransaction("UpdateOrder", resul.ID, resul.Name, resul.Type,resul.Contains.join(','),resul.Issuer, resul.Owner,status, resul.transferTo);
			res.send("Update Order Sucessfully");

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

router.get("/order/getShipping", async function(req, res){
	try {
		  // const ccp = buildCCPOrg4();
		  // const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org4.example.com');
		  // const wallet = await buildWallet(Wallets, walletPath);
		  // await enrollAdmin(caClient, wallet, mspOrg4);
		  // await registerAndEnrollUser(caClient, wallet, mspOrg4, org4UserId, 'org4.department1');
		  const ccp = buildCCPOrg4();
		const wallet =  await Wallets.newFileSystemWallet( walletPath4);
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});
			  const network = await gateway.getNetwork(channelName);
			  const contract = network.getContract('order');
  
			  //Function to get Orders in Shipping
				//await contract.submitTransaction('CreateOrder', 'O7', 'Order7', 'Order', '[P1, P3, P5]', 'Retailer', 'Supplier', 'Shipping','Retailer');
			  let result = await contract.evaluateTransaction('QueryOrdersByShippingStatus', 'Shipping');
			  res.send(prettyJSONString(result.toString()));
  
		  } finally {
			  gateway.disconnect();
		  }
	  } catch (error) {
		  console.error(`******** FAILED to run the application: ${error}`);
	  }
  })
  router.get("/order/getRequested", async function(req, res){
	try {
		  // const ccp = buildCCPOrg4();
		  // const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org4.example.com');
		  // const wallet = await buildWallet(Wallets, walletPath);
		  // await enrollAdmin(caClient, wallet, mspOrg4);
		  // await registerAndEnrollUser(caClient, wallet, mspOrg4, org4UserId, 'org4.department1');
		  const ccp = buildCCPOrg4();
		const wallet =  await Wallets.newFileSystemWallet( walletPath4);
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});
  
			  const network = await gateway.getNetwork(channelName);
			  const contract = network.getContract('order');
  
			  //Function to get Orders in Shipping
				//await contract.submitTransaction('CreateOrder', 'O7', 'Order7', 'Order', '[P1, P3, P5]', 'Retailer', 'Supplier', 'Shipping','Retailer');
			  let result = await contract.evaluateTransaction('QueryOrdersByShippingStatus', 'Requested');
			  res.send(prettyJSONString(result.toString()));
  
		  } finally {
			  gateway.disconnect();
		  }
	  } catch (error) {
		  console.error(`******** FAILED to run the application: ${error}`);
	  }
  })
  router.get("/order/getShipped", async function(req, res){
	try {
		  // const ccp = buildCCPOrg4();
		  // const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org4.example.com');
		  // const wallet = await buildWallet(Wallets, walletPath);
		  // await enrollAdmin(caClient, wallet, mspOrg4);
		  // await registerAndEnrollUser(caClient, wallet, mspOrg4, org4UserId, 'org4.department1');
			const ccp = buildCCPOrg4();
			const wallet =  await Wallets.newFileSystemWallet( walletPath4);
			const gateway = new Gateway();
	
			try {
				await gateway.connect(ccp, {
					wallet,
					identity: 'admin',
					discovery: { enabled: true, asLocalhost: true }
				});
			  const network = await gateway.getNetwork(channelName);
			  const contract = network.getContract('order');
  
			  //Function to get Orders in Shipping
				//await contract.submitTransaction('CreateOrder', 'O7', 'Order7', 'Order', '[P1, P3, P5]', 'Retailer', 'Supplier', 'Shipping','Retailer');
			  let result = await contract.evaluateTransaction('QueryOrdersByShippingStatus', 'Shipped');
			  res.send(prettyJSONString(result.toString()));
  
		  } finally {
			  gateway.disconnect();
		  }
	  } catch (error) {
		  console.error(`******** FAILED to run the application: ${error}`);
	  }
  })
  
  
module.exports=router;