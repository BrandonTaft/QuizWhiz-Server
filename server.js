const express = require('express')

const cors = require('cors')

const app = express() 



app.use(cors())
app.use(express.json())



app.get('/api/users', (req, res) => {
        models.Things.findAll({
            raw:true,
            limit:10,
            order: [
                sequelize.fn('max', sequelize.col('score'))
            ],
           
            
          //  [['score', 'Desc']]
        })
            .then(things => {
                res.json(things)
                console.log(things)
            })
    
        })


app.listen(8080, () => {
    console.log('Server is running...')
})