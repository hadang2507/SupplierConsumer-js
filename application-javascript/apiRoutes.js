const express = require("express")
const router = express.Router()
const path = require('path');
const farmer = require("./farmer.js")
const supplier = require("./supplier.js")
const retailer = require("./retailer.js")
// api route

router.use('/farmer/action', farmer)
router.use('/supplier/action', supplier)
//router.use('/retailer/action', retailer)

router.get('/', (req, res) => {
  res.sendFile('index.html', {
      root: path.join(__dirname, './pages')
  })
  console.log("Homepage") 
})

router.get('/farmer',(req, res)=>{
  res.sendFile('farmer.html',{
    root: path.join(__dirname, './pages')
  })
  console.log("Farmer Page")
})


router.get('/supplier',(req, res)=>{
  res.sendFile('supplier.html',{
    root: path.join(__dirname, './pages')
  })
  console.log("Supplier Page")
})

router.get('/deliver',(req, res)=>{
  res.sendFile('deliver.html',{
    root: path.join(__dirname, './pages')
  })
  console.log("Deliver Page")
})

router.get('/retailer',(req, res)=>{
  res.sendFile('retailer.html',{
    root: path.join(__dirname, './pages')
  })
  console.log("Retailer Page")
})


// router.get('/login-famer', (req, res)=>{
//   res.sendFile('FarmerLogin.html',{
//     root: path.join(__dirname, '../pages')
//   })
// })
// router.get('/login-supplier', (req, res)=>{
//   res.sendFile('SupplierLogin.html',{
//     root: path.join(__dirname, '../pages')
//   })
// })
// router.get('/login-deliver', (req, res)=>{
//   res.sendFile('DeliverLogin.html',{
//     root: path.join(__dirname, '../pages')
//   })
// })

// router.get('/login-retailer', (req, res)=>{
//   res.sendFile('RetailerLogin.html',{
//     root: path.join(__dirname, '../pages')
//   })
// })

// router.post('/auth-farmer', (req, res) => {
//   // Insert Login Code Here
//   let username = req.body.fusername;
//   let password = req.body.fpassword;
//   res.send(`Username: ${username} Password: ${password}`);
//   if (username && password) {
// 			if (username == "farmer" && password == "1234abcd") {
// 				req.session.loggedin = true;
// 				res.redirect('/farmer');
// 			} else {
// 				res.send('Incorrect Username and/or Password!');
// 			}			
// 			res.end();
// 	} else {
// 		res.send('Please enter Username and Password!');
// 		res.end();
// 	}
// });


module.exports = router 