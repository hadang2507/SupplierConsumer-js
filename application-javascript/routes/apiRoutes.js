const express = require("express")
const app = express()
const router = express.Router()
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// api route
const addIngredient = require("./addIngredient_Org1")

router.get('/', (req, res) => {
  res.sendFile('index.html', {
      root: path.join(__dirname, '../pages')
  })
  console.log("Homepage") 
})

router.get('/login-famer', (req, res)=>{
  res.sendFile('FarmerLogin.html',{
    root: path.join(__dirname, '../pages')
  })
})
router.get('/login-supplier', (req, res)=>{
  res.sendFile('SupplierLogin.html',{
    root: path.join(__dirname, '../pages')
  })
})
router.get('/login-deliver', (req, res)=>{
  res.sendFile('DeliverLogin.html',{
    root: path.join(__dirname, '../pages')
  })
})
router.get('/login-retailer', (req, res)=>{
  res.sendFile('RetailerLogin.html',{
    root: path.join(__dirname, '../pages')
  })
})
router.post('/farmer', (req, res) => {
  // Insert Login Code Here
  let username = req.body.fusername;
  let password = req.body.fpassword;
  res.send(`Username: ${username} Password: ${password}`);
});


module.exports = router 