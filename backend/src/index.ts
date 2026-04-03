import express from "express";
import userRouter from "./routers/user"
import workerRouter from "./routers/worker"
import platformRouter from "./routers/platform"
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors())

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "nine9six-api" });
});

app.use("/v1", platformRouter);
app.use("/v1/user", userRouter);
app.use("/v1/worker", workerRouter);

app.listen(3000)
