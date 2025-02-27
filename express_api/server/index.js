const express = require("express")
const bodyParser = require('body-parser');
const app = express()
 
let username = "root";
let password = "root";
 
let items = [
    { id: 0, name: 'Vítkovo brýle' },
    { id: 1, name: 'ARCH Iso installation stick' }
];
let token = "asodigkibaoa1616q1f6a1ef3d";
app.use(bodyParser.json())
app.get('/login/:username/:password', (req, res) => {
    if (req.params.username === username && req.params.password === password) {
        res.status(200).json({token:token});
    } else {
        res.status(400).json({messge:"Invalid Credentials"});
    }
});
 
app.get('/items', (req, res) => {
  res.json({result:200, items:items})
});
 
app.get('/item/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({message:'Item not found'});
  res.status(200).json(item);
});
 
app.post('/item/add/:token/:id/:name', (req, res) => {
  let inToken = req.params.token;
  if (inToken != token) {
    res.status(502).json({message: "Unauthorized - Invalid Token"});
    return;
  }
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) {
    items.push({id:parseInt(req.params.id), name:req.params.name});
    return res.json(items.find(i => i.id == parseInt(req.params.id)))
  }
  
return res.status(400).json({message:'Item with this id already exists'});
});
 
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
