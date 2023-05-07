const fs = require('fs');
const express = require('express');

const app = express();

//middleware
app.use(express.json());



/*
// get is http method   / is route URl
app.get('/', (req , res) =>{
//res.status(200).send('Hello from the Server side!..');
res
.status(200)
.json({status: 'success' ,mesaage:'Hello from the Server side!..' , app: 'Natours'});

})

// for POST
app.post('/', (req, res) =>{
  res.send('You can Post to this EndPoint')  
});
*/

const tours = JSON.parse(fs.readFileSync(`${__dirname}/starter/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) =>{
res.status(200).json({
  status:'Success',
  result:tours.length,
  data:{
    tours
  }
})
})
//Route for passing ID in request URL
app.get('/api/v1/tours/:id/:x/:y?', (req, res) =>{

  
  console.log(req.params);
  res.status(200).json({
    status:'Success',
    //result:tours.length,
    //data:{
      //tours
    //}
  })
  })

// for POST
app.post('/api/v1/tours' , (req , res) =>{
//console.log(req.body);
const newId = tours[tours.length-1].id + 1;
const newTour = Object.assign({id:newId}, req.body);

tours.push(newTour);

fs.writeFile(`${__dirname}/starter/dev-data/data/tours-simple.json`,JSON.stringify(tours) , err =>{
res.status(201).json({
  status:'success',
  data:{
    tour:newTour
  }
})
})

//res.end('Done');
})

const port = 3000;
app.listen(port, () =>{
    console.log(`App running on port ${port}...`);
});