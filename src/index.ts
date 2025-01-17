import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import main from "./models/db";
import userRouter from "./routes/user"; 
import notificationRouter from "./routes/notification";
import sessionRouter from "./routes/session";


dotenv.config();

const app: Application = express();
const PORT: number = 3001;

main()
  .then(() => {
    app.listen(PORT, (): void => {
      console.log("SERVER IS UP ON PORT:", PORT);
    });
    console.log("DB connected");
  })
  .catch(console.error);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send("Therapy API")
})

app.use("/user", userRouter);
app.use("/notification", notificationRouter);
app.use("/session", sessionRouter);
