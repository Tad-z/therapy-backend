import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import main from "./src/models/db"; // Make sure the path is correct
import userRouter from "./src/routes/user"; // Make sure the path is correct


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
