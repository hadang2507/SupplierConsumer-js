'use strict';

const express = require("express")
const router = express.Router()
const cookieParser = require('cookie-parser');



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
        var session;

        const username = req.body.fusername;
        const password = req.body.fpassword;
        const name = username+password;
		const wallet =  await Wallets.newFileSystemWallet( walletPath1);
        const userExists = await wallet.get(name);
        if (userExists) {
            // create session
            session=req.session;
            session.userid='farmer';
            //res.cookie('session', name, { expires: new Date(Date.now() + 9000000000000000)})
            res.redirect("/farmer")
        return;
        }
        res.redirect('/register-farmer')
    }catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
router.post("/supplier", async function (req, res){
	try {
        var session;

        const username = req.body.susername;
        const password = req.body.spassword;
        const name = username+password;
		const wallet =  await Wallets.newFileSystemWallet( walletPath2);
		const userExists = await wallet.get(name);
        if (userExists) {
            // create session
            session=req.session;
            session.userid='supplier';
            //res.cookie('session', name, { expires: new Date(Date.now() + 9000000000000000)})
            res.redirect("/supplier")
        return;
        }
        res.redirect('/register-supplier')
    }catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
router.post("/retailer", async function (req, res){
	try {
        var session;
        const username = req.body.rusername;
        const password = req.body.rpassword;
        const name = username+password;
		const wallet =  await Wallets.newFileSystemWallet(  walletPath3);
		const userExists = await wallet.get(name);
        if (userExists) {
            // create session
            session=req.session;
            session.userid='retailer';
            //res.cookie('session', name, { expires: new Date(Date.now() + 9000000000000000)})
            res.redirect("/retailer")
        return;
        }
        res.redirect('/register-retailer')
    }catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
router.post("/deliver", async function (req, res){
	try {
        var session;

        const username = req.body.dusername;
        const password = req.body.dpassword;
        const name = username+password;
		const ccp = buildCCPOrg4();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org4.example.com');
		const wallet =  await Wallets.newFileSystemWallet( walletPath4);
		const userExists = await wallet.get(name);
        console.log(name);
        if (userExists) {
            // create session
            session=req.session;
            session.userid='deliver';
            //res.cookie('session', name, { expires: new Date(Date.now() + 9000000000000000)})
            res.redirect("/deliver")
        return;
        }
        res.redirect('/register-deliver')
    }catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
})
module.exports = router