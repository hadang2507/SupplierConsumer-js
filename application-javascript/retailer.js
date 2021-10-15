'use strict';

const express = require("express")
const router = express.Router()


const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg3, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel2';
const chaincodeName = 'order';
const mspOrg3 = 'Org3MSP';
const walletPath = path.join(__dirname, 'wallet3');
const org3UserId = 'org3User5';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

//View All Orders
router.get("/product/getAll", async function (req, res){
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
			const contract = network.getContract("product");

			// GET ALL ORDERS
			let result = await contract.evaluateTransaction('GetAllProducts');
			res.send(prettyJSONString(result.toString()));

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
router.get("/order/create", async function (req, res){
	try {
		const id = req.query.id;
		const name = req.query.name;
		const type = req.query.type;
        const contain = req.query.contain;
		const issuer = req.query.issuer;
        const owner = req.query.owner;
		const status = req.query.status;
		const transferTo = req.query.transferto;
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

			// CREATE PRODUCT
			try {
				const exist =await contract.submitTransaction("OrderExists", id)
				if (exist=='false') {
					//Function for Org3 to add new Order
					console.log("id")
					gateway.disconnect();
					await gateway.connect(ccp, {
						wallet,
						identity: org3UserId,
						discovery: { enabled: true, asLocalhost: true } 
					});
					const network2 = await gateway.getNetwork(channelName);
					const contract2 = network2.getContract("product");
					const myArr = contain.split(",");
					for (const value of myArr) {
						if ((await contract2.submitTransaction("ProductExists", value))=='false'){
							res.send("Some Product does not exist.")
							return
						}
						console.log(value)
					}
					gateway.disconnect();
					await gateway.connect(ccp, {
						wallet,
						identity: org3UserId,
						discovery: { enabled: true, asLocalhost: true } 
					});
					const network3 = await gateway.getNetwork(channelName);
					const contract3 = network3.getContract(chaincodeName);
					await contract3.submitTransaction('CreateOrder', id, name, type, contain, issuer, owner,status,transferTo);
					res.send('Order has been submitted');
				} else {
					res.send("Order has already added to the world state")
				}
			} catch (createError) {
				res.send("Caught the error: \n ${createError}");
			}

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

router.get("/order/getShipping", async function(req, res){
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
				  discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
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
				  discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
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
				  discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
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