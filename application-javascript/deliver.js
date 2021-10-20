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
			let result = await contract.evaluateTransaction('GetAllOrders');
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

router.post("/order/acceptShipment", async function (req, res){
	try {
    const id = req.body.id;

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

router.post("/order/changeShipmentStatus", async function (req, res){
	try {
		const id = req.body.id;
		const status = req.body.status;

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
					let style = '<style> #my_table{border-collapse:collapse;width :100%;}' + '#my_table td, #my_table th{border:1px solid #ddd;padding:8px}' + '#my_table tr:hover {background-color: #D8E9A8;}' + '#my_table th{padding-top:12px;padding-bottom:12px;text-align:center;background-color: #368F23;color: white;} </style>'
					let header = '<!DOCTYPE html>' + '<html lang="en">\n' + '<head><title>Data</title>' + style + '</head>'
						let body = '<h1 style="text-align:center;margin-bottom:20px;font-weight:bolder;font-size:60px;color:#082D08;">Show Data</h1><br><table id="my_table">\n<thead>' + table_header + '\n</thead>\n<tbody>\n' + table_body + '\n</tbody>\n</table>'
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
  
module.exports=router;