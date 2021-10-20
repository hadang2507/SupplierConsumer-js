'use strict';

const express = require("express")
const router = express.Router()
//const Jsontableify = require('jsontableify')
const json2html = require('node-json2html');
const fs = require('fs-extra')

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
// const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel1';
const chaincodeName = 'ingredient';
const walletPath1 = path.join(__dirname, 'wallet1');

// const mspOrg1 = 'Org1MSP';
// const walletPath = path.join(__dirname, 'wallet1');
// const org1UserId = 'org1User';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

router.post("/ingredient/create", async function (req, res){
  try {

		const id = req.body.iid;
		const name = req.body.iname;
		const type = req.body.itype;
		const issuer = req.body.iissuer;

		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg1);
		// await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
		const ccp = buildCCPOrg1();
		const wallet =  await Wallets.newFileSystemWallet( walletPath1);
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			// CREATE INGREDIENT
			try {
				//const exists = await contract.submitTransaction("IngredientExists", id);
				//res.send(exists)
				// if (exists==true) {
				// 	res.send("Ingredient has already added to the world state")	
				// }		
				await contract.submitTransaction("CreateIngredient", id, name, type, issuer);
				res.send("Create Ingredient Sucessfully");
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

router.post("/ingredient/update", async function (req, res){
  try {
		const id = req.body.iid;
		const name = req.body.iname;
		const type = req.body.itype;
		
		// const ccp = buildCCPOrg1();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg1);
		// await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
		const ccp = buildCCPOrg1();
		const wallet =  await Wallets.newFileSystemWallet( walletPath1);
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			// UPDATE INGREDIENT
			try {
				await contract.submitTransaction('UpdateIngredient', id, name, type, 'Org1');
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

router.get("/ingredient/getAll", async function (req, res){
  try {

		const ccp = buildCCPOrg1();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg1);
		// await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

		const wallet =  await Wallets.newFileSystemWallet( walletPath1);
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: 'admin',
				discovery: { enabled: true, asLocalhost: true }
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);
		
			//Return all asset data
			let result = await contract.evaluateTransaction('GetAllIngredients');
			//result = JSON.parse(result);
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

router.post("/ingredient/delete", async function(req, res){
	try {

		const id = req.body.iid

		// const ccp = buildCCPOrg1();
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		// const wallet = await buildWallet(Wallets, walletPath);
		// await enrollAdmin(caClient, wallet, mspOrg1);
		// await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

		const ccp = buildCCPOrg1();
		const wallet =  await Wallets.newFileSystemWallet( walletPath1);
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
			await contract.submitTransaction('DeleteIngredient',id);
			res.send("Delete Successfully");

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})


module.exports = router