const express = require("express");
const models = require("./models");
const cors = require("cors");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sequelize = require("sequelize");
const axios = require("axios");

const salt = 10;

require("dotenv").config();

app.use(cors());
app.use(express.json());

//***************************REGISTRATION***************************//

app.post("/api/register", async (req, res) => {
  const userName = req.body.userName;
  const password = req.body.password;
  const token = req.body.token;

  const persistedUser = await models.Users.findOne({
    where: {
      name: userName
    }
  });

  if (persistedUser == null) {
    bcrypt.hash(password, salt, async (error, hash) => {
      console.log(hash);
      if (error) {
        res.json({ message: "Something Went Wrong!!!" });
      } else {
        const user = models.Users.build({
          name: userName,
          password: hash,
          token: token
        });

        let savedUser = await user.save();
        if (savedUser != null) {
          res.json({ success: true });
        }
      }
    });
  } else {
    res.json({ message: " Sorry This UserName Already Exists." });
  }
});

//***************************LOGIN PAGE***************************//

app.post("/api/login", async (req, res) => {
  const userName = req.body.userName;
  const password = req.body.password;

  let user = await models.Users.findOne({
    where: {
      name: userName
    }
  });

  if (user != null) {
    bcrypt.compare(password, user.password, (error, result) => {
      if (result) {
        const token = jwt.sign({ name: userName }, process.env.JWT_SECRET_KEY);
        res.json({
          success: true,
          token: token,
          name: userName,
          user_id: user.id
        });
      } else {
        res.json({ success: false, message: "Not Authenticated" });
      }
    });
  } else {
    res.json({ message: "Username Incorrect" });
  }
});

//***************************HIGH SCORE***************************//

app.get("/api/highscore", (req, res) => {
  let leaderboard = [];
  let tempuser = {};
  models.Users.findAll({
    raw: true,
    limit: 10,
    group: ["high_score", "Users.id"],
    order: [[sequelize.fn("max", sequelize.col("high_score")), "DESC"]]

    //  [['score', 'Desc']]
  }).then(high_Score => {
    for (let i = 0; i < 5; i++) {
      leaderboard.push({
        username: high_Score[i]["name"],
        score: high_Score[i]["high_score"]
      });
    }
    res.json(leaderboard);
  });
});

//***************************Users HIGH SCORE***************************//

app.get("/api/userscore", (req, res) => {
  let username = req.query["username"];
  models.Users.findOne({
    where: {
      name: username
    }
  }).then(user_Score => {
    console.log(user_Score)
    })
    res.json(username);
});

//***************************Get questions***************************//

app.get("/quiz", (req, res) => {
  let category = req.query["category"];
  if (category == 100) {
    axios
      .get(
        `https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple`
      )
      .then(response => response.data)
      .then(result => {
        console.log(result);
        res.json(result.results);
      });
  } else {
    axios
      .get(
        `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=easy&type=multiple`
      )
      .then(response => response.data)
      .then(result => {
        console.log(result);
        res.json(result.results);
      });
  }
});
//**************************Delete user**************************//

//localstorage.clear on users end as well
app.post("/api/deleteuser", async (req, res) => {
  let user = await models.Users.destroy({
    where: {
      name: req.body.username
    }
  })
  .then(removeduser=>{
    console.log(`removed ${req.body.username}`)
  })
})

//**************************Submit Score**************************//

app.post("/api/submit", async (req, res) => {
  console.log(req.body.username);
  let user = await models.Users.findOne({
    where: {
      name: req.body.username
    }
  });

  if (user["high_score"] < req.body.score) {
    models.Users.update(
      { high_score: req.body.score },
      { where: { name: req.body.username } }
    ).then(result => {
      res.send("New high score!");
    });
  } else {
    res.send("Better luck next time");
  }
});

//**************************Server Hosting**************************//
app.listen(8080, () => {
  console.log("Server is running...");
});
