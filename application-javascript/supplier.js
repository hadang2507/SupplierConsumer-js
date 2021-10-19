'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
// const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg2, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel2';
const chaincodeName = 'product';
const walletPath2 = path.join(__dirname, 'wallet2');

// const mspOrg2 = 'Org2MSP';
// const walletPath = path.join(__dirname, 'wallet2');
// const org2UserId = 'org2User';

const express = require("express")
const router = express.Router()

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

router.post("/product/create", async function (req, res){
	//Check if Ingredient exists
	try {
		const id = req.body.pid
    const madeOf = req.body.pmadeof;
		const str = madeOf.toString();
		const madeOfStr = str.split(",");		

		// const ccp = buildCCPOrg2();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg2);
		// await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');

		const ccp = buildCCPOrg2();
		const wallet =  await Wallets.newFileSystemWallet( walletPath2)
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});

			const network = await gateway.getNetwork('mychannel1');
			const contract = network.getContract('ingredient');

			// CREATE PRODUCT
			try {
				for(const value of madeOfStr){
					let result = await contract.evaluateTransaction('IngredientExists', value);
					if(result == 'false'){
						// console.log(result);
						// console.log(value)
						res.send('Ingredient to make Product ' + id + ' does not exist');
						return;
					}
				}
			} catch (createError) {
				res.send("Caught the error" + createError);
			}
		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}

	//CREATE PRODUCT AFTER CHECKING INGREDIENT
	try {
		const id = req.query.pid;
		const name = req.query.pname;
		const type = req.query.ptype;
    const madeOf = req.query.pmadeof;
		const issuer = req.query.pissuer;
    const owner = req.query.powner;

		// const ccp = buildCCPOrg2();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg2);
		// await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');
		const ccp = buildCCPOrg2();
		const wallet =  await Wallets.newFileSystemWallet( walletPath2)
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});
			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			// CREATE PRODUCT
			try {
					//Function for Org2 to add new Product
					//console.log('\n--> Submit Transaction: CreateProduct, creates new asset with id, Name, Type, madeOf, Issuer, Owner arguments');
					//console.log(madeOf)
					await contract.submitTransaction('CreateProduct', id, name, type, madeOf, issuer, owner);
					res.send("Product " + id + " added succesfully");
			} catch (createError) {
				res.send("Caught the error" + createError);
			}
		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

router.post("/product/update", async function (req, res){
	try {
		const id = req.body.pid;
		const name = req.body.pname;
		const madeof = req.body.pmadeof;
		

		// const ccp = buildCCPOrg2();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg2);
		// await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');

		const ccp = buildCCPOrg2();
		const wallet =  await Wallets.newFileSystemWallet( walletPath2)
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			// UPDATE PRODUCT
			try {
				await contract.submitTransaction('UpdateProduct', id, name, "product", madeof, "Org2", "Org2");
				res.send("Update Product " + id + " successfully")

			} catch (updateError) {
				res.send("Caught the error " + updateError);
			}
		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})

router.get("/product/getAll", async function (req, res){
	try {

		// const ccp = buildCCPOrg2();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg2);
		// await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');

		const ccp = buildCCPOrg2();
		const wallet =  await Wallets.newFileSystemWallet( walletPath2)
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});
			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			// GET ALL PRODUCT
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

router.get("/ingredient/getAll", async function (req, res){
	try {
		
		// const ccp = buildCCPOrg2();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg2);
		// await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');
		
		const ccp = buildCCPOrg2();
		const wallet =  await Wallets.newFileSystemWallet( walletPath2)
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});

			const network = await gateway.getNetwork('mychannel1');
			const contract = network.getContract('ingredient');
		
			//Function to get all ingredients
			let result = await contract.evaluateTransaction('GetAllIngredients');
			let resultStr = result.toString();
			console.log(JSON.parse(resultStr));
			resultStr = JSON.parse(resultStr);
			//FROM JSON TO HTML TABLE
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

router.post("/product/delete", async function(req, res){
	try {
		const id = req.body.iid

		// const ccp = buildCCPOrg2();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg2);
		// await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');

		const ccp = buildCCPOrg2();
		const wallet =  await Wallets.newFileSystemWallet( walletPath2)
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);
		
			// DELETE INGREDIENT
			await contract.evaluateTransaction('DeleteProduct', id);
			res.send("Delete Successfully");

		} finally {
			gateway.disconnect();
		}

	} catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
})

router.get("/order/getShipping", async function(req, res){
  try {
		// const ccp = buildCCPOrg2();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg2);
		// await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');

		const ccp = buildCCPOrg2();
		const wallet =  await Wallets.newFileSystemWallet( walletPath2)
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
		// const ccp = buildCCPOrg2();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg2);
		// await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');

		const ccp = buildCCPOrg2();
		const wallet =  await Wallets.newFileSystemWallet( walletPath2)
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
		// const ccp = buildCCPOrg2();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg2);
		// await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');
		const ccp = buildCCPOrg2();
		const wallet =  await Wallets.newFileSystemWallet( walletPath2)
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




module.exports = router