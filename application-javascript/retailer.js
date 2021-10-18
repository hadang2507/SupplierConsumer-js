'use strict';

const express = require("express")
const router = express.Router()


const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
// const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg3, buildWallet } = require('../../test-application/javascript/AppUtil.js');
const walletPath3 = path.join(__dirname, 'wallet3');
const { buildCCPOrg2 } = require('../../test-application/javascript/AppUtil.js');
const walletPath2 = path.join(__dirname, 'wallet2');

const channelName = 'mychannel2';
const chaincodeName = 'order';
var madeOfStr;
// const mspOrg3 = 'Org3MSP';
// const walletPath = path.join(__dirname, 'wallet3');
// const org3UserId = 'org3User5';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

//View All Products
router.get("/product/getAll", async function (req, res){
	try {

		// const ccp = buildCCPOrg3();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org3.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg3);
		// await registerAndEnrollUser(caClient, wallet, mspOrg3, org3UserId, 'org3.department1');

		const ccp = buildCCPOrg3();
		const wallet =  await Wallets.newFileSystemWallet( walletPath3);
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});


			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract("product");

			// GET ALL ORDERS
			let result = await contract.evaluateTransaction('GetAllProducts');
			let resultStr = result.toString();
			console.log(JSON.parse(resultStr));
			resultStr = JSON.parse(resultStr);
			//FROM JSON TO HTML TABLE
			let template_table_header = {
				"<>": "tr", "html": [
						{"<>": "th", "html": "ID"},
						{"<>": "th", "html": "Name"},
						{"<>": "th", "html": "Type"},
						{"<>": "th", "html": "madeOf"},
						{"<>": "th", "html": "Issuer"},
						{"<>": "th", "html": "Owner"},
						{"<>": "th", "html": "docType"},
				]
			}
			let template_table_body = {
				"<>": "tr", "html": [
						{"<>": "td", "html": "${ID}"},
						{"<>": "td", "html": "${Name}"},
						{"<>": "td", "html": "${Type}"},
						{"<>": "td", "html": "${madeOf}"},
						{"<>": "td", "html": "${Issuer}"},
						{"<>": "td", "html": "${Owner}"},
						{"<>": "td", "html": "${docType}"},
				]
			}
			let table_header = json2html.transform(resultStr[0], template_table_header);
			let table_body = json2html.transform(resultStr, template_table_body);
			let header = '<!DOCTYPE html>' + '<html lang="en">\n' + '<head><title>Data</title></head>'
    	let body = '<h1>Show Data</h1><br><table id="my_table" >\n<thead>' + table_header + '\n</thead>\n<tbody>\n' + table_body + '\n</tbody>\n</table>'
    	body = '<body>' + body + '</body>'
    	let html = header + body + '</html>';
			res.send(html);

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
router.post("/order/create", async function (req, res){
	try {
		const id = req.body.id;
		const name = req.body.name;
		const type = req.body.type;
    const contain = req.body.contain;
		const issuer = req.body.issuer;
    const owner = req.body.owner;
		const status = req.body.status;
		const transferTo = req.body.transferto;

		// const ccp = buildCCPOrg3();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org3.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg3);
		// await registerAndEnrollUser(caClient, wallet, mspOrg3, org3UserId, 'org3.department1');
		const ccp = buildCCPOrg3();
		const wallet =  await Wallets.newFileSystemWallet( walletPath3);
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			// CREATE Order
			try {
				const exist =await contract.submitTransaction("OrderExists", id)
				if (exist=='false') {
					//Function for Org3 to add new Order
					console.log("id")
					gateway.disconnect();

					await gateway.connect(ccp, {
						wallet,
						identity: 'admin',
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
						identity: 'admin',
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

		  // const ccp = buildCCPOrg3();
		  // const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org3.example.com');
		  // const wallet = await buildWallet(Wallets, walletPath);
		  // await enrollAdmin(caClient, wallet, mspOrg3);
		  // await registerAndEnrollUser(caClient, wallet, mspOrg3, org3UserId, 'org3.department1');

		  const ccp = buildCCPOrg3();
		const wallet =  await Wallets.newFileSystemWallet( walletPath3);
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
			  let resultStr = result.toString();
			console.log(JSON.parse(resultStr));
			resultStr = JSON.parse(resultStr);
			//FROM JSON TO HTML TABLE
			let template_table_header = {
				"<>": "tr", "html": [
						{"<>": "th", "html": "ID"},
						{"<>": "th", "html": "Name"},
						{"<>": "th", "html": "Type"},
						{"<>": "th", "html": "Contains"},
						{"<>": "th", "html": "Issuer"},
						{"<>": "th", "html": "Owner"},
						{"<>": "th", "html": "shippingStatus"},
						{"<>": "th", "html": "transferTo"},
						{"<>": "th", "html": "docType"},
				]
			}
			let template_table_body = {
				"<>": "tr", "html": [
						{"<>": "td", "html": "${ID}"},
						{"<>": "td", "html": "${Name}"},
						{"<>": "td", "html": "${Type}"},
						{"<>": "td", "html": "${Contains}"},
						{"<>": "td", "html": "${Issuer}"},
						{"<>": "td", "html": "${Owner}"},
						{"<>": "td", "html": "${shippingStatus}"},
						{"<>": "td", "html": "${transferTo}"},
						{"<>": "td", "html": "${docType}"},
				]
			}
			let table_header = json2html.transform(resultStr[0], template_table_header);
			let table_body = json2html.transform(resultStr, template_table_body);
			let header = '<!DOCTYPE html>' + '<html lang="en">\n' + '<head><title>Data</title></head>'
    	let body = '<h1>Show Data</h1><br><table id="my_table" >\n<thead>' + table_header + '\n</thead>\n<tbody>\n' + table_body + '\n</tbody>\n</table>'
    	body = '<body>' + body + '</body>'
    	let html = header + body + '</html>';
			res.send(html);
  
		  } finally {
			  gateway.disconnect();
		  }
	  } catch (error) {
		  console.error(`******** FAILED to run the application: ${error}`);
	  }
})
router.get("/order/getRequested", async function(req, res){
	try {

		  // const ccp = buildCCPOrg3();
		  // const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org3.example.com');
		  // const wallet = await buildWallet(Wallets, walletPath);
		  // await enrollAdmin(caClient, wallet, mspOrg3);
		  // await registerAndEnrollUser(caClient, wallet, mspOrg3, org3UserId, 'org3.department1');

		  const ccp = buildCCPOrg3();
		const wallet =  await Wallets.newFileSystemWallet( walletPath3);
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
			  let resultStr = result.toString();
			console.log(JSON.parse(resultStr));
			resultStr = JSON.parse(resultStr);
			//FROM JSON TO HTML TABLE
			let template_table_header = {
				"<>": "tr", "html": [
						{"<>": "th", "html": "ID"},
						{"<>": "th", "html": "Name"},
						{"<>": "th", "html": "Type"},
						{"<>": "th", "html": "Contains"},
						{"<>": "th", "html": "Issuer"},
						{"<>": "th", "html": "Owner"},
						{"<>": "th", "html": "shippingStatus"},
						{"<>": "th", "html": "transferTo"},
						{"<>": "th", "html": "docType"},
				]
			}
			let template_table_body = {
				"<>": "tr", "html": [
						{"<>": "td", "html": "${ID}"},
						{"<>": "td", "html": "${Name}"},
						{"<>": "td", "html": "${Type}"},
						{"<>": "td", "html": "${Contains}"},
						{"<>": "td", "html": "${Issuer}"},
						{"<>": "td", "html": "${Owner}"},
						{"<>": "td", "html": "${shippingStatus}"},
						{"<>": "td", "html": "${transferTo}"},
						{"<>": "td", "html": "${docType}"},
				]
			}
			let table_header = json2html.transform(resultStr[0], template_table_header);
			let table_body = json2html.transform(resultStr, template_table_body);
			let header = '<!DOCTYPE html>' + '<html lang="en">\n' + '<head><title>Data</title></head>'
    	let body = '<h1>Show Data</h1><br><table id="my_table" >\n<thead>' + table_header + '\n</thead>\n<tbody>\n' + table_body + '\n</tbody>\n</table>'
    	body = '<body>' + body + '</body>'
    	let html = header + body + '</html>';
			res.send(html);
  
		  } finally {
			  gateway.disconnect();
		  }
	  } catch (error) {
		  console.error(`******** FAILED to run the application: ${error}`);
	  }
})
router.get("/order/getShipped", async function(req, res){
	try {

		  // const ccp = buildCCPOrg3();
		  // const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org3.example.com');
		  // const wallet = await buildWallet(Wallets, walletPath);
		  // await enrollAdmin(caClient, wallet, mspOrg3);
		  // await registerAndEnrollUser(caClient, wallet, mspOrg3, org3UserId, 'org3.department1');

		  const ccp = buildCCPOrg3();
		const wallet =  await Wallets.newFileSystemWallet( walletPath3);
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
			  let resultStr = result.toString();
			console.log(JSON.parse(resultStr));
			resultStr = JSON.parse(resultStr);
			//FROM JSON TO HTML TABLE
			let template_table_header = {
				"<>": "tr", "html": [
						{"<>": "th", "html": "ID"},
						{"<>": "th", "html": "Name"},
						{"<>": "th", "html": "Type"},
						{"<>": "th", "html": "Contains"},
						{"<>": "th", "html": "Issuer"},
						{"<>": "th", "html": "Owner"},
						{"<>": "th", "html": "shippingStatus"},
						{"<>": "th", "html": "transferTo"},
						{"<>": "th", "html": "docType"},
				]
			}
			let template_table_body = {
				"<>": "tr", "html": [
						{"<>": "td", "html": "${ID}"},
						{"<>": "td", "html": "${Name}"},
						{"<>": "td", "html": "${Type}"},
						{"<>": "td", "html": "${Contains}"},
						{"<>": "td", "html": "${Issuer}"},
						{"<>": "td", "html": "${Owner}"},
						{"<>": "td", "html": "${shippingStatus}"},
						{"<>": "td", "html": "${transferTo}"},
						{"<>": "td", "html": "${docType}"},
				]
			}
			let table_header = json2html.transform(resultStr[0], template_table_header);
			let table_body = json2html.transform(resultStr, template_table_body);
			let header = '<!DOCTYPE html>' + '<html lang="en">\n' + '<head><title>Data</title></head>'
    	let body = '<h1>Show Data</h1><br><table id="my_table" >\n<thead>' + table_header + '\n</thead>\n<tbody>\n' + table_body + '\n</tbody>\n</table>'
    	body = '<body>' + body + '</body>'
    	let html = header + body + '</html>';
			res.send(html);
  
		  } finally {
			  gateway.disconnect();
		  }
	  } catch (error) {
		  console.error(`******** FAILED to run the application: ${error}`);
	  }
})
router.post("/order/getIngredientinProduct",async function(req, res){
	try {
		const id = req.body.id;
		// const ccp = buildCCPOrg3();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org3.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg3);
		// await registerAndEnrollUser(caClient, wallet, mspOrg3, org3UserId, 'org3.department1');

		const ccp = buildCCPOrg2();
		const wallet =  await Wallets.newFileSystemWallet( walletPath2);
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});


			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract("product");

			// GET Product from Product ID
			let result = await contract.evaluateTransaction('ReadProduct', id);
			let resultStr = result.toString();
			//console.log(JSON.parse(resultStr).madeOf);
			const str = JSON.parse(resultStr).madeOf.toString();
			madeOfStr = str.split(",");
			console.log(madeOfStr);
		} finally {
			gateway.disconnect();
		}

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});


			const network = await gateway.getNetwork("mychannel1");
			const contract = network.getContract("ingredient");
			let str = "[";
			for(const value of madeOfStr){
				let result = await contract.evaluateTransaction('ReadIngredient', value);
				str += result + ",";
			}
			str = str.substring(0, str.length - 1);
			str += "]";
			str = JSON.parse(str);
			console.log(str);
			let template_table_header = {
				"<>": "tr", "html": [
						{"<>": "th", "html": "ID"},
						{"<>": "th", "html": "Name"},
						{"<>": "th", "html": "Type"},
						{"<>": "th", "html": "Issuer"},
						{"<>": "th", "html": "docType"},
				]
			}
			let template_table_body = {
				"<>": "tr", "html": [
						{"<>": "td", "html": "${ID}"},
						{"<>": "td", "html": "${Name}"},
						{"<>": "td", "html": "${Type}"},
						{"<>": "td", "html": "${Issuer}"},
						{"<>": "td", "html": "${docType}"},
				]
			}
			let table_header = json2html.transform(str[0], template_table_header);
			let table_body = json2html.transform(str, template_table_body);
			let header = '<!DOCTYPE html>' + '<html lang="en">\n' + '<head><title>Data</title></head>'
    	let body = '<h1>Show Data</h1><br><table id="my_table" >\n<thead>' + table_header + '\n</thead>\n<tbody>\n' + table_body + '\n</tbody>\n</table>'
    	body = '<body>' + body + '</body>'
    	let html = header + body + '</html>';
			res.send(html);

		} finally {
			gateway.disconnect();
		}
		
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}	
})

module.exports=router;