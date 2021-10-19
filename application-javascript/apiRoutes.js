const express = require("express")
const router = express.Router()
const path = require('path');
const farmer = require("./farmer.js")
const supplier = require("./supplier.js")
const retailer = require("./retailer.js")
const deliver = require("./deliver.js")
const registration = require("./registration.js")
const login = require("./login.js")
// api route

router.use('/farmer/action', farmer)
router.use('/supplier/action', supplier)
router.use('/retailer/action', retailer)
router.use('/shipper/action', deliver)
router.use('/registration', registration)
router.use('/login', login)

router.get('/', (req, res) => {
  res.sendFile('new_index.html', {
      root: path.join(__dirname, './pages')
  })
  console.log("Homepage") 
})
// router.get('/new_index', (req, res) => {
//   res.sendFile('new_index.html', {
//       root: path.join(__dirname, './pages')
//   })
//   console.log("Homepage") 
// })

router.get('/logout',(req,res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/farmer',(req, res)=>{
  var session=req.session;
    if(session.userid == 'farmer'){
      res.sendFile('farmer.html',{
        root: path.join(__dirname, './pages')
      })
    }else{
      res.redirect("/login-farmer")
    }
  console.log("Farmer Page")
})


router.get('/supplier',(req, res)=>{
  var session=req.session;
    if(session.userid == 'supplier'){
      res.sendFile('supplier.html',{
        root: path.join(__dirname, './pages')
      })
    }else{
      res.redirect("/login-supplier")
    }
  console.log("Supplier Page");
})

router.get('/deliver',(req, res)=>{
  var session=req.session;
    if(session.userid == 'deliver'){
      res.sendFile('deliver.html',{
        root: path.join(__dirname, './pages')
      })
    }else{
      res.redirect("/login-deliver")
    }
  console.log("Deliver Page")
})

router.get('/retailer',(req, res)=>{
  var session=req.session;
    if(session.userid == 'retailer'){
      res.sendFile('retailer.html',{
        root: path.join(__dirname, './pages')
      })
    }else{
      res.redirect("/login-retailer")
    }
  console.log("Retailer Page")
})


router.get('/login-farmer', (req, res)=>{
  res.sendFile('FarmerLogin.html',{
    root: path.join(__dirname, './pages')
  })
})
router.get('/login-supplier', (req, res)=>{
  res.sendFile('SupplierLogin.html',{
    root: path.join(__dirname, './pages')
  })
})
router.get('/login-deliver', (req, res)=>{
  res.sendFile('DeliverLogin.html',{
    root: path.join(__dirname, './pages')
  })
})
router.get('/login-retailer', (req, res)=>{
  res.sendFile('RetailerLogin.html',{
    root: path.join(__dirname, './pages')
  })
})

router.get('/register-farmer', (req, res)=>{
  res.sendFile('FarmerRegistration.html',{
    root: path.join(__dirname, './pages')
  })
})
router.get('/register-supplier', (req, res)=>{
  res.sendFile('SupplierRegistration.html',{
    root: path.join(__dirname, './pages')
  })
})
router.get('/register-deliver', (req, res)=>{
  res.sendFile('DeliverRegistration.html',{
    root: path.join(__dirname, './pages')
  })
})
router.get('/register-retailer', (req, res)=>{
  res.sendFile('RetailerRegistration.html',{
    root: path.join(__dirname, './pages')
  })
})

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