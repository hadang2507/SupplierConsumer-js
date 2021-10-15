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

router.get("/farmer", async function (req, res){
	try {
        const username = req.query.fusername;
        const password = req.query.fpassword;
        const name = username+password;
		const wallet =  await Wallets.newFileSystemWallet( walletPath1);
        const userExists = await wallet.get(name);
        if (userExists) {
            res.redirect("/farmer")
        return;
        }
        res.send("Unknown Identity"); 
    }catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
router.get("/supplier", async function (req, res){
	try {
        const username = req.query.susername;
        const password = req.query.spassword;
        const name = username+password;
		const wallet =  await Wallets.newFileSystemWallet( walletPath2);
		const userExists = await wallet.get(name);
        if (userExists) {
            res.redirect("/supplier")
        return;
        }
        res.send("Unknown Identity");
    }catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
router.get("/retailer", async function (req, res){
	try {
        const username = req.query.rusername;
        const password = req.query.rpassword;
        const name = username+password;
		const wallet =  await Wallets.newFileSystemWallet(  walletPath3);
		const userExists = await wallet.get(name);
        if (userExists) {
            res.redirect("/supplier")
        return;
        }
        res.send("Unknown Identity");
    }catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
router.get("/shipper", async function (req, res){
	try {
        const username = req.query.dusername;
        const password = req.query.dpassword;
        const name = username+password;
		const ccp = buildCCPOrg4();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org4.example.com');
		const wallet =  await Wallets.newFileSystemWallet( walletPath4);
		const userExists = await wallet.get(name);
        if (userExists) {
            res.redirect("/supplier")
        return;
        }
        res.send("Unknown Identity");
    }catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
module.exports = router