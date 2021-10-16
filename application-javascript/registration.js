'use strict';

const express = require("express")
const router = express.Router()


const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const {buildCCPOrg1,buildCCPOrg2,buildCCPOrg3, buildCCPOrg4, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel2';
const chaincodeName = 'order';
const mspOrg4 = 'Org4MSP';
const mspOrg3 = 'Org3MSP';
const mspOrg2 = 'Org2MSP';
const mspOrg1 = 'Org1MSP';
const walletPath4 = path.join(__dirname, 'wallet4');
const walletPath3 = path.join(__dirname, 'wallet3');
const walletPath2 = path.join(__dirname, 'wallet2');
const walletPath1 = path.join(__dirname, 'wallet1');

router.post("/farmer", async function (req, res){
	try {
		const username = req.body.fusername;
		const password = req.body.fpassword;
		const name = username+password;
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath1);

		console.log(name);

		await enrollAdmin(caClient, wallet, mspOrg1);
		await registerAndEnrollUser(caClient, wallet, mspOrg1, name, 'org1.department1');
        res.redirect("/login-farmer")
    }catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
router.post("/supplier", async function (req, res){
	try {
		const username = req.body.susername;
		const password = req.body.spassword;
		const name = username+password;
		const ccp = buildCCPOrg2();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		const wallet = await buildWallet(Wallets, walletPath2);

		console.log(name);

		await enrollAdmin(caClient, wallet, mspOrg2);
		await registerAndEnrollUser(caClient, wallet, mspOrg2, name, 'org2.department1');
        res.redirect("/login-supplier")
    }catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
router.post("/retailer", async function (req, res){
	try {
		const username = req.body.rusername;
		const password = req.body.rpassword;
		const name = username+password;
		const ccp = buildCCPOrg3();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org3.example.com');
		const wallet = await buildWallet(Wallets, walletPath3);
		await enrollAdmin(caClient, wallet, mspOrg3);
		await registerAndEnrollUser(caClient, wallet, mspOrg3, name, 'org3.department1');
        res.redirect("/login-retailer")
    }catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
router.post("/deliver", async function (req, res){
	try {
		const username = req.body.dusername;
		const password = req.body.dpassword;
		const name = username+password;
		const ccp = buildCCPOrg4();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org4.example.com');
		const wallet = await buildWallet(Wallets, walletPath4);
		await enrollAdmin(caClient, wallet, mspOrg4);
		await registerAndEnrollUser(caClient, wallet, mspOrg4, name, 'org4.department1');
        res.redirect("/login-deliver")
    }catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
module.exports = router 