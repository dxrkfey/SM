const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mysql = require("mysql2/promise");
const multer = require("multer");
const line = require("./line");
const path = require("path");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const { userInfo } = require("os");

// Extend Day.js with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Define the Bangkok timezone
const BANGKOK_TZ = "Asia/Bangkok";

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



app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await conn.query(`INSERT INTO user (Email, Password) VALUES (?, ?)`, [
    email,
    hash,
  ]);
  res.send("Register Successfully");
});

// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   const [result] = await conn.query(
//     "SELECT UserID, Password FROM user WHERE Email = ?",
//     [email]
//   );
//   if (result.length === 0 || !result[0].Password) {
//     return res.status(400).send("Wrong Email or Password");
//   }
//   const match = await bcrypt.compare(password, result[0].Password);
//   if (!match) {
//     return res.status(400).send("Wrong Email or Password");
//   }
//   const token = jwt.sign(
//     { email, userID: 2, role: "admin" },
//     // secret,
//     // { expiresIn: "1h" }
//   );

//   res.json({
//     message: "Login Successfully",
//     token,
//     isOk: match,
//   });
// });

app.get("/user", async (req, res) => {
  try {
    const user = isLogin(req); 
    const [userResult] = await conn.query(
      `SELECT * FROM user WHERE ID = ?`,
      [user.userID]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const [tokensResult] = await conn.query(
      `SELECT line.LineID, line.Token AS notificationToken 
       FROM line 
       WHERE line.UserID = ?`,
      [user.userID]
    );

    // Map over tokensResult to include both LineID and notificationToken
    const notificationTokens = tokensResult.map(row => ({
      LineID: row.LineID,
      notificationToken: row.notificationToken
    }));

    const responseData = {
      ...userResult[0],
      notificationTokens,
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error in /user route:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});




app.post("/edit-user", async (req, res) => {
  try {
    const { email, username, company, phone, address,  profilePicData } =
      req.body;
    const user = isLogin(req);
    const query = profilePicData
      ? "UPDATE user SET Email = ?, Username = ?, Company = ?, Phone = ?, Address = ?, ProfilePic = ? WHERE ID = ?"
      : "UPDATE user SET Email = ?, Username = ?, Company = ?, Phone = ?, Address = ? WHERE ID = ?";

    const params = profilePicData
      ? [email, username, company, phone, address, profilePicData, user.userID]
      : [email, username, company, phone, address, user.userID];

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
    const { lineToken } = req.body;
    const user = isLogin(req);
    const lineTokens = Array.isArray(lineToken) ? lineToken : [lineToken];
    const values = lineTokens.map((token) => [token,user.userID]);
    await conn.query("INSERT INTO line (token,UserID) VALUES ?", [values]);
    res.status(200).json({ message: "Tokens added successfully" });
  } catch (error) {
    console.error("Error adding tokens:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/remove-linetoken", async (req, res) => {
  try {
    const { lineID } = req.body; 
    await conn.query(
      "DELETE from line WHERE LineID = ?",
      [lineID]
    );

    res.status(200).json({ message: "Tokens remove successfully" });
  } catch (error) {
    console.error("Error adding tokens:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.use("/images", express.static("picture"));

app.get("/smoke", async (req, res) => {
  try {
    const [result] = await conn.query(
      `SELECT s.*, 
              (SELECT COUNT(*) FROM smoke.smoke 
               WHERE DATE(date_time) = CURDATE() AND Status = 1) AS Black,
              (SELECT COUNT(*) FROM smoke.smoke 
               WHERE DATE(date_time) = CURDATE() AND Status = 0) AS White
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
    if (data.Status && data.TimeOfSmoke == 5) {
      const [tokensResult] = await conn.query("SELECT Token AS line FROM line");
      console.log("Tokens Result:", tokensResult);

      const message = "⚠️ Black smoke detected!";
      const imagePath = "./picture/101.109.253.60.8999.jpg"
      tokensResult.forEach((tokenRow) => {
        const token = tokenRow.line; 
        console.log("Sending notification to token:", token);
        if (!token) {
          console.error("Error: Token is undefined");
          return;
        }

        line.callLineApi(token, message,imagePath);
      });
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching smoke data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/filter-smoke", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required." });
    }

    // Parse start and end dates as UTC and convert to Bangkok timezone
    let start = dayjs.utc(startDate).tz(BANGKOK_TZ);
    let end = dayjs.utc(endDate).tz(BANGKOK_TZ);

    // Adjust end time if start and end times are the same
    if (start.isSame(end)) {
      end = end.add(1, "minute");
    } else if (end.isBefore(start)) {
      return res
        .status(400)
        .json({ message: "endDate must be after startDate." });
    }

    // Format dates for SQL queries in 'YYYY-MM-DD HH:mm:ss'
    const startDateFormatted = start.format("YYYY-MM-DD HH:mm:ss");
    const endDateFormatted = end.format("YYYY-MM-DD HH:mm:ss");

    console.log(`Adjusted Start Date (Bangkok Time): ${startDateFormatted}`);
    console.log(`Adjusted End Date (Bangkok Time): ${endDateFormatted}`);

    // Initialize data containers
    let normalData = [];
    let dailyData = [];
    let monthlyData = [];
    let yearlyData = [];

    // Queries
    try {
      [normalData] = await conn.query(
        `SELECT * FROM smoke 
         WHERE date_time BETWEEN ? AND ?;`,
        [startDateFormatted, endDateFormatted]
      );
    } catch (error) {
      console.error("Error in normalData query:", error);
      return res.status(500).json({ message: "Error in normalData query" });
    }
    try {
      [dailyData] = await conn.query(
        `SELECT
           SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) AS Black,
           SUM(CASE WHEN Status = 0 THEN 1 ELSE 0 END) AS White
         FROM smoke.smoke
         WHERE date_time BETWEEN ? AND ?;`,
        [startDateFormatted, endDateFormatted]
      );
    } catch (error) {
      console.error("Error in dailyData query:", error);
      return res.status(500).json({ message: "Error in dailyData query" });
    }

    try {
      [monthlyData] = await conn.query(
        `SELECT
           SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) AS Black,
           SUM(CASE WHEN Status = 0 THEN 1 ELSE 0 END) AS White
         FROM smoke.smoke
         WHERE
           YEAR(date_time) = YEAR(?) AND
           MONTH(date_time) = MONTH(?);`,
        [startDateFormatted, startDateFormatted]
      );
    } catch (error) {
      console.error("Error in monthlyData query:", error);
      return res.status(500).json({ message: "Error in monthlyData query" });
    }

    try {
      [yearlyData] = await conn.query(
        `SELECT
           SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) AS Black,
           SUM(CASE WHEN Status = 0 THEN 1 ELSE 0 END) AS White
         FROM smoke.smoke
         WHERE
           YEAR(date_time) = YEAR(?);`,
        [startDateFormatted]
      );
    } catch (error) {
      console.error("Error in yearlyData query:", error);
      return res.status(500).json({ message: "Error in yearlyData query" });
    }
    res.status(200).json({ normalData, dailyData, monthlyData, yearlyData });
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

// const isLogin = (req) => {
//   const authHeader = req.headers["authorization"];
//   let authToken = "";
//   if (authHeader) {
//     authToken = authHeader.split(" ")[1];
//   }
//   const user = jwt.verify(authToken, secret);

//   if (authToken) {
//     return user;
//   } else {
//     return null;
//   }
// };

const isLogin = (req) => {
  return {
    email: "admin@gmail.com",
    userID: 2
  };
};

