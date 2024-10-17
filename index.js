import express from 'express'
import {connectionDB} from './DB/connection.js'
import { globalResponse } from './SRC/Middleware/error-handle.middleware.js';

import userRouter from './SRC/Modules/User/user.routes.js';
import categoryRouter from './SRC/Modules/Category/category.routes.js';

import { config } from 'dotenv';
import path from "path";

import cors from 'cors'; 
 
const app = express();

if (process.env.NODE_ENV === 'prod') {
    config({ path: path.resolve('.prod.env') });
} else if (process.env.NODE_ENV === 'dev') {
    config({ path: path.resolve('.dev.env') });
} else {
    config();
}


let port = process.env.PORT;
app.use(cors());
app.use(express.json())

app.use('/user',userRouter);
app.use('/category',categoryRouter);

app.use(globalResponse);

connectionDB()

console.log("port" , process.env.CONNECTION_DB_URI);

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

