const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mysql = require("mysql2/promise");
const multer = require("multer");
const line = require("./line");
const path = require("path");

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173"],
  })
);

const port = 8000;
const secret = "password";
let conn = null;

const initMySQL = async () => {
  conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "smoke",
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "picture/");
  },
  filename: (req, file, cb) => {
    cb(null, "smoke.jpg");
  },
});

const upload = multer({ storage });

const checkForSmoke = async () => {
  try {
    const [results] = await conn.query(
      "SELECT * FROM smoke WHERE TimeOfSmoke = 5 AND Status = 'Black' ORDER BY No DESC LIMIT 1"
    );

    if (results.length > 0) {
      const record = results[0];
      const [user] = await conn.query("SELECT Token FROM line");

      if (user.length > 0) {
        const imagePath = path.join(__dirname, "picture", "smoke.jpg");

        line.callLineApi(
          user[0].LineToken,
          "Smoke alert! Smoke is Black",
          imagePath
        );
      }
    }
  } catch (error) {
    console.error("Error checking smoke alert:", error);
  }
};

setInterval(checkForSmoke, 10000);

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await conn.query(`INSERT INTO user (Email, Password) VALUES (?, ?)`, [
    email,
    hash,
  ]);
  res.send("Register Successfully");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const [result] = await conn.query(
    "SELECT UserID, Password FROM user WHERE Email = ?",
    [email]
  );
  if (result.length === 0 || !result[0].Password) {
    return res.status(400).send("Wrong Email or Password");
  }
  const match = await bcrypt.compare(password, result[0].Password);
  if (!match) {
    return res.status(400).send("Wrong Email or Password");
  }
  const token = jwt.sign(
    { email, userID: result[0].UserID, role: "admin" },
    secret,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login Successfully",
    token,
    isOk: match,
  });
});

app.get("/user", async (req, res) => {
  try {
    // const user = isLogin(req);
    // if (!user) {
    //   throw { message: "Auth Fail" };
    // }
    const [result] = await conn.query(
      `SELECT * FROM users WHERE ID = ${user.userID}`
    );
    res.send(result[0]);
  } catch (error) {
    console.log("error", error);
    res.status(401).send("Session Expired");
  }
});

app.post("/edit-user", async (req, res) => {
  try {
    const { email, name, position, company, ProfilePic } = req.body;
    const user = isLogin(req);
    const query = ProfilePic
      ? "UPDATE users SET Email = ?, Name = ?, Position = ?,Company = ?, ProfilePic = ? WHERE ID = ?"
      : "UPDATE users SET Email = ?, Name = ?, Position = ?,Company = ? WHERE ID = ?";

    const params = ProfilePic
      ? [email, name, position, company, ProfilePic, user.userID]
      : [email, name, position, company, user.userID];

    await conn.query(query, params);
    res.send("Edit User Successfully");
  } catch (error) {
    console.error("Error in /edit-user:", error);
    res.status(500).send("An error occurred");
  }
});

app.post("/edit-linetoken", async (req, res) => {
  try {
    const { lineToken, lineID } = req.body;
    // const user = isLogin(req);
    // if (!user) {
    //   throw { message: "Auth Fail" };
    // }
    await conn.query("UPDATE line SET Token = ? WHERE LineID = ?", [
      lineToken,
      lineID,
    ]);
  } catch (error) {
    console.log("error", error);
  }
});

app.post("/add-linetoken", async (req, res) => {
  try {
    // const { lineToken } = req.body;
    // const user = isLogin(req);
    // if (!user) {
    //   return res.status(401).json({ message: "Auth Fail" });
    // }
    await conn.query("INSERT INTO token (line, UserID) VALUES (?, ?)", [
      lineToken,
      user.userID,
    ]);
    res.status(200).json({ message: "Token added successfully" });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// app.get("/real-smoke", async (req, res) => {
//   try {
//     // const user = isLogin(req);
//     // if (!user) {
//     //   return res.status(401).json({ message: "Auth Fail" });
//     // }

//     const [result] = await conn.query(
//       `SELECT * FROM smoke.smoke
//          ORDER BY date_time DESC
//          LIMIT 1`
//     );

//     res.status(200).json(result[0] || {});
//   } catch (error) {
//     console.error("error", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

app.use("/images", express.static("picture"));

app.get("/smoke", async (req, res) => {
  try {
    const [result] = await conn.query(
      `SELECT s.*, 
              (SELECT COUNT(*) FROM smoke.smoke 
               WHERE DATE(date_time) = CURDATE() AND Status = 1) AS BlackCount,
              (SELECT COUNT(*) FROM smoke.smoke 
               WHERE DATE(date_time) = CURDATE() AND Status = 0) AS WhiteCount
       FROM smoke.smoke s
       WHERE DATE(s.date_time) = CURDATE()
       ORDER BY s.date_time DESC
       LIMIT 1`
    );
    const data = result[0] || {};

    const responseData = {
      data: data,
      imageUrl: `${req.protocol}://${req.get(
        "host"
      )}/images/101.109.253.60.8999.jpg`,
      blackCount: data.BlackCount || 0,
      whiteCount: data.WhiteCount || 0,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching smoke data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/filter-smoke", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // First Query
    let normalData =[];
    try {
      [normalData] = await conn.query(
        `SELECT * FROM smoke 
         WHERE date_time BETWEEN ? AND ?;`,
        [startDate, endDate]
      );
      console.log("NOR", normalData);
    } catch (error) {
      console.error("Error in normalData query:", error);
      res.status(500).json({ message: "Error in normalData query" });
      return;
    }

    // Second Query
    let dailyData = [];
    try {
      [dailyData] = await conn.query(
        `SELECT
           SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) AS Black,
           SUM(CASE WHEN Status = 0 THEN 1 ELSE 0 END) AS White
         FROM smoke.smoke
         WHERE date_time BETWEEN ? AND ?
         ORDER BY No DESC`,
        [startDate, endDate]
      );
    } catch (error) {
      console.error("Error in dailyData query:", error);
      res.status(500).json({ message: "Error in dailyData query" });
      return;
    }

    // Third Query
    let monthlyData = [];
    try {
      [monthlyData] = await conn.query(
        `   SELECT
         SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) AS Black,
         SUM(CASE WHEN Status = 0 THEN 1 ELSE 0 END) AS White
        FROM smoke.smoke
        WHERE
        YEAR(date_time) BETWEEN YEAR(?) AND YEAR(?) AND
        MONTH(date_time) BETWEEN month(?) AND MONTH(?)
        `,
        [startDate, endDate, startDate, endDate]
      );
    } catch (error) {
      console.error("Error in monthlyData query:", error);
      res.status(500).json({ message: "Error in monthlyData query" });
      return;
    }

    // Fourth Query
    let yearlyData = [];
    try {
      [yearlyData] = await conn.query(
        `SELECT
         SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) AS Black,
         SUM(CASE WHEN Status = 0 THEN 1 ELSE 0 END) AS White
        FROM smoke.smoke
        WHERE
        YEAR(date_time) BETWEEN YEAR(?) AND YEAR(?)`,
        [startDate, endDate]
      );
    } catch (error) {
      console.error("Error in yearlyData query:", error);
      res.status(500).json({ message: "Error in yearlyData query" });
      return;
    }

    res.status(200).json({ normalData, dailyData, monthlyData,yearlyData });
  } catch (error) {
    console.error("Error querying smoke data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/add-smoke", async (req, res) => {
  try {
    const { result } = req.body;
    const [lastStatusRecord] = await conn.query(
      `SELECT Status FROM smoke.smoke ORDER BY No DESC LIMIT 1`
    );
    if (lastStatusRecord.length > 0 && lastStatusRecord[0].Status == result) {
      const [lastRecord] = await conn.query(
        `SELECT TimeOfSmoke, Status, No FROM smoke.smoke ORDER BY No DESC LIMIT 1`
      );
      console.log("last", lastRecord);
      const newTimeOfSmoke = lastRecord[0].TimeOfSmoke + 1;
      await conn.query(`UPDATE smoke.smoke SET TimeOfSmoke = ? WHERE No = ?`, [
        newTimeOfSmoke,
        lastRecord[0].No,
      ]);
      return res.status(200).json({
        message: "TimeOfSmoke updated successfully",
      });
    } else {
      await conn.query(
        `INSERT INTO smoke.smoke (Status, TimeOfSmoke) VALUES (?, ?)`,
        [result, 1]
      );
      return res.status(200).json({ message: "Status added successfully" });
    }
  } catch (error) {
    console.error("Detailed Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

app.listen(port, async () => {
  await initMySQL();
  console.log("run at" + port);
});

const isLogin = (req) => {
  const authHeader = req.headers["authorization"];
  let authToken = "";
  if (authHeader) {
    authToken = authHeader.split(" ")[1];
  }
  const user = jwt.verify(authToken, secret);

  if (authToken) {
    return user;
  } else {
    return null;
  }
};
