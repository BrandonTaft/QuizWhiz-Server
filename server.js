const express = require('express')
const models = require('./models')
const cors = require('cors')
const app = express()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const  sequelize = require('sequelize')

const salt = 10

require('dotenv').config()

app.use(cors())
app.use(express.json())


//***************************REGISTRATION***************************//

app.post('/api/register', async (req, res) => {

    
    const userName = req.body.userName
    const password = req.body.password
    const token = req.body.token

    const persistedUser = await models.Users.findOne({
        where: {
            name: userName
        }
    })

    if (persistedUser == null) {
        bcrypt.hash(password, salt, async (error, hash) => {
            console.log(hash)
            if (error) {
                res.json({ message: "Something Went Wrong!!!" })
            } else {
                const user = models.Users.build({
                    name: userName,
                    password: hash,
                    token: token
                })

                let savedUser = await user.save()
                if (savedUser != null) {
                    res.json({ success: true })
                }
            }
        })
    } else {
        res.json({ message: " Sorry This UserName Already Exists." })
    }
})

//***************************LOGIN PAGE***************************//

app.post('/api/login', async (req, res) => {

    const userName = req.body.userName
    const password = req.body.password

    let user = await models.Users.findOne({
        where: {
            name : userName,
        }
    })

    if (user != null) {
        bcrypt.compare(password, user.password, (error, result) => {
            if (result) {
                const token = jwt.sign({ name:userName }, "SECRETKEY")
                res.json({ success: true, token: token, name:userName, user_id:user.id})
            } else {
                res.json({ success: false, message: 'Not Authenticated' })
            }
        })

    } else {
        res.json({ message: "Username Incorrect" })
    }
})

app.get('/api/highscore', (req, res) => {
        models.Users.findAll({
            raw:true,
            limit:10,
            order: [
                sequelize.fn('max', sequelize.col('high_score'))
            ],
           
            
          //  [['score', 'Desc']]
        })
            .then(high_Score => {
                res.json(high_Score)
                console.log(high_Score)
            })
    
        })


app.listen(8080, () => {
    console.log('Server is running...')
})