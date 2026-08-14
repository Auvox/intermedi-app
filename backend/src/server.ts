import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        mensagem: "Teste02"
    });
});

app.listen(3000, () => {
    console.log("servidor: http://localhost:3000");
});