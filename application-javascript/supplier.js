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
						//{"<>": "th", "html": "docType"},
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
						//{"<>": "td", "html": "${docType}"},
				]
			}
			let table_header = json2html.transform(resultStr[0], template_table_header);
			let table_body = json2html.transform(resultStr, template_table_body);
			
			let style = '<style> #my_table{border-collapse:collapse;width :100%;}' + '#my_table td, #my_table th{border:1px solid #ddd;padding:8px}' + '#my_table tr:hover {background-color: #905CD2; color: #FFEB35;}' + '#my_table th{padding-top:12px;padding-bottom:12px;text-align:center;background-color:#FFECA7;color:#6C0DE5;font-weight:bolder;font-size:18px;} </style>'
			let header = '<!DOCTYPE html>' + '<html lang="en">\n' + '<head><title>Data</title>' + style + '</head>'
    		let body = '<h1 style="text-align:center;margin-bottom:20px;font-weight:bolder;font-size:60px;color:#562FB9;">Show Data</h1><br><table id="my_table">\n<thead>' + table_header + '\n</thead>\n<tbody>\n' + table_body + '\n</tbody>\n</table>'
    		body = '<body style = "margin-top: 58px;text-align: center;background-color: #efefef;">' + body + '</body>'
    		
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
						//{"<>": "th", "html": "docType"},
				]
			}
			let template_table_body = {
				"<>": "tr", "html": [
						{"<>": "td", "html": "${ID}"},
						{"<>": "td", "html": "${Name}"},
						{"<>": "td", "html": "${Type}"},
						{"<>": "td", "html": "${Issuer}"},
						//{"<>": "td", "html": "${docType}"},
				]
			}
			let table_header = json2html.transform(resultStr[0], template_table_header);
			let table_body = json2html.transform(resultStr, template_table_body);
			
			let style = '<style> #my_table{border-collapse:collapse;width :100%;}' + '#my_table td, #my_table th{border:1px solid #ddd;padding:8px}' + '#my_table tr:hover {background-color: #905CD2; color: #FFEB35;}' + '#my_table th{padding-top:12px;padding-bottom:12px;text-align:center;background-color:#FFECA7;color:#6C0DE5;font-weight:bolder;font-size:18px;} </style>'
			let header = '<!DOCTYPE html>' + '<html lang="en">\n' + '<head><title>Data</title>' + style + '</head>'
    		let body = '<h1 style="text-align:center;margin-bottom:20px;font-weight:bolder;font-size:60px;color:#562FB9;">Show Data</h1><br><table id="my_table">\n<thead>' + table_header + '\n</thead>\n<tbody>\n' + table_body + '\n</tbody>\n</table>'
    		body = '<body style = "margin-top: 58px;text-align: center;background-color: #efefef;">' + body + '</body>'
    		
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
						//{"<>": "th", "html": "docType"},
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
						//{"<>": "td", "html": "${docType}"},
				]
			}
			let table_header = json2html.transform(resultStr[0], template_table_header);
			let table_body = json2html.transform(resultStr, template_table_body);
			
			let style = '<style> #my_table{border-collapse:collapse;width :100%;}' + '#my_table td, #my_table th{border:1px solid #ddd;padding:8px}' + '#my_table tr:hover {background-color: #905CD2; color: #FFEB35;}' + '#my_table th{padding-top:12px;padding-bottom:12px;text-align:center;background-color:#FFECA7;color:#6C0DE5;font-weight:bolder;font-size:18px;} </style>'
			let header = '<!DOCTYPE html>' + '<html lang="en">\n' + '<head><title>Data</title>' + style + '</head>'
    		let body = '<h1 style="text-align:center;margin-bottom:20px;font-weight:bolder;font-size:60px;color:#562FB9;">Show Data</h1><br><table id="my_table">\n<thead>' + table_header + '\n</thead>\n<tbody>\n' + table_body + '\n</tbody>\n</table>'
    		body = '<body style = "margin-top: 58px;text-align: center;background-color: #efefef;">' + body + '</body>'
    		
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
						//{"<>": "th", "html": "docType"},
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
						//{"<>": "td", "html": "${docType}"},
				]
			}
			let table_header = json2html.transform(resultStr[0], template_table_header);
			let table_body = json2html.transform(resultStr, template_table_body);
			
			let style = '<style> #my_table{border-collapse:collapse;width :100%;}' + '#my_table td, #my_table th{border:1px solid #ddd;padding:8px}' + '#my_table tr:hover {background-color: #905CD2; color: #FFEB35;}' + '#my_table th{padding-top:12px;padding-bottom:12px;text-align:center;background-color:#FFECA7;color:#6C0DE5;font-weight:bolder;font-size:18px;} </style>'
			let header = '<!DOCTYPE html>' + '<html lang="en">\n' + '<head><title>Data</title>' + style + '</head>'
    		let body = '<h1 style="text-align:center;margin-bottom:20px;font-weight:bolder;font-size:60px;color:#562FB9;">Show Data</h1><br><table id="my_table">\n<thead>' + table_header + '\n</thead>\n<tbody>\n' + table_body + '\n</tbody>\n</table>'
    		body = '<body style = "margin-top: 58px;text-align: center;background-color: #efefef;">' + body + '</body>'
    		
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
						//{"<>": "th", "html": "docType"},
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
						//{"<>": "td", "html": "${docType}"},
				]
			}
			let table_header = json2html.transform(resultStr[0], template_table_header);
			let table_body = json2html.transform(resultStr, template_table_body);
			
			let style = '<style> #my_table{border-collapse:collapse;width :100%;}' + '#my_table td, #my_table th{border:1px solid #ddd;padding:8px}' + '#my_table tr:hover {background-color: #905CD2; color: #FFEB35;}' + '#my_table th{padding-top:12px;padding-bottom:12px;text-align:center;background-color:#FFECA7;color:#6C0DE5;font-weight:bolder;font-size:18px;} </style>'
			let header = '<!DOCTYPE html>' + '<html lang="en">\n' + '<head><title>Data</title>' + style + '</head>'
    		let body = '<h1 style="text-align:center;margin-bottom:20px;font-weight:bolder;font-size:60px;color:#562FB9;">Show Data</h1><br><table id="my_table">\n<thead>' + table_header + '\n</thead>\n<tbody>\n' + table_body + '\n</tbody>\n</table>'
    		body = '<body style = "margin-top: 58px;text-align: center;background-color: #efefef;">' + body + '</body>'
    		
    		let html = header + body + '</html>';
			res.send(html);

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
router.post("/order/getOrderHistory", async function(req, res){
	try {

			let id = req.body.id;

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
	
				const network = await gateway.getNetwork("mychannel2");
				const contract = network.getContract("order");
	
				//Function to get Orders in Shipping
				//await contract.submitTransaction('CreateOrder', 'O7', 'Order7', 'Order', '[P1, P3, P5]', 'Retailer', 'Supplier', 'Shipping','Retailer');
				let result = await contract.evaluateTransaction('GetOrderHistory', id);
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
							//{"<>": "th", "html": "docType"},
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
							//{"<>": "td", "html": "${docType}"},
					]
				}
				let table_header = json2html.transform(resultStr[0], template_table_header);
				let table_body = json2html.transform(resultStr, template_table_body);

				let style = '<style> #my_table{border-collapse:collapse;width :100%;}' + '#my_table td, #my_table th{border:1px solid #ddd;padding:8px}' + '#my_table tr:hover {background-color: #905CD2; color: #FFEB35;}' + '#my_table th{padding-top:12px;padding-bottom:12px;text-align:center;background-color:#FFECA7;color:#6C0DE5;font-weight:bolder;font-size:18px;} </style>'
				let header = '<!DOCTYPE html>' + '<html lang="en">\n' + '<head><title>Data</title>' + style + '</head>'
				let body = '<h1 style="text-align:center;margin-bottom:20px;font-weight:bolder;font-size:60px;color:#562FB9;">Show Data</h1><br><table id="my_table">\n<thead>' + table_header + '\n</thead>\n<tbody>\n' + table_body + '\n</tbody>\n</table>'
				body = '<body style = "margin-top: 58px;text-align: center;background-color: #efefef;">' + body + '</body>'

					
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
