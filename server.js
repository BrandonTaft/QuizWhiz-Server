const express = require('express')
const models = require('./models')
const cors = require('cors')
const app = express()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const salt = 10

app.use(cors())
app.use(express.json())


//***************************REGISTRATION***************************//

app.post('/api/register', async (req, res) => {

    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const userName = req.body.userName
    const password = req.body.password
    const token = req.body.token

    const persistedUser = await models.Users.findOne({
        where: {
            userName: userName
        }
    })

    if (persistedUser == null) {
        bcrypt.hash(password, salt, async (error, hash) => {
            console.log(hash)
            if (error) {
                res.json({ message: "Something Went Wrong!!!" })
            } else {
                const user = models.Users.build({
                    userName: userName,
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
            userName : userName,
        }
    })

    if (user != null) {
        bcrypt.compare(password, user.password, (error, result) => {
            if (result) {
                const token = jwt.sign({ name:name }, "SECRETKEY")
                res.json({ success: true, token: token, name:name, user_id:user.id})
            } else {
                res.json({ success: false, message: 'Not Authenticated' })
            }
        })

    } else {
        res.json({ message: "Username Incorrect" })
    }
})

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