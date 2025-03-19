require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Railway DB 연결 설정
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 40000, // 10초 후 연결 시도 실패 처리. mysql 패키지에서는 acquireTimeout 사용
    enableKeepAlive: true, // TCP KeepAlive 활성화
    keepAliveInitialDelay: 0 // 즉시 KeepAlive 패킷 전송
});

const checkDbConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("DB Connection successful!");
        connection.release(); // 연결 반환
    } catch (err) {
        console.error("DB Connection failed: ", err);
        process.exit(1); // DB 연결 실패 시 서버 종료
    }
};

checkDbConnection();

// 예제 API - users 테이블 조회
app.get("/user", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM user");
        res.json(rows);
    } catch (error) {
        console.error("DB Error:", error);
        res.status(500).json({ error: "Database connection failed" });
    }
});

// 서버 실행
const PORT = process.env.APP_PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
});
