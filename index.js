import express from 'express'
import {connectionDB} from './DB/connection.js'
import { globalResponse } from './SRC/Middleware/error-handle.middleware.js';

import userRouter from './SRC/Modules/User/user.routes.js';
import categoryRouter from './SRC/Modules/Category/category.routes.js';
import menuRouter from './SRC/Modules/Menu/menu.routes.js';
import cartRouter from "./SRC/Modules/Cart/cart.routes.js";
import addressRouter from './SRC/Modules/Address/address.routes.js';
import orderRouter from './SRC/Modules/Order/order.routes.js';
import reviewRouter from './SRC/Modules/Review/review.routes.js';
import paymentRouter from "./SRC/Modules/Payment/payment.routes.js"
import morgan from 'morgan';
import { config } from 'dotenv';
import path from "path";

import { createServer } from 'http';
import { initSocket , push} from './SRC/utils/socket.js'

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
app.use(morgan("dev"))

const httpServer = createServer(app);
initSocket(httpServer);

app.use('/user',userRouter);
app.use('/category',categoryRouter);
app.use('/menu',menuRouter);
app.use('/cart',cartRouter);
app.use('/address',addressRouter);
app.use('/order',orderRouter);
app.use('/review', reviewRouter);
app.use('/pay', paymentRouter)

app.use(globalResponse);

connectionDB()

console.log("port" , process.env.CONNECTION_DB_URI);

app.get('/', (req, res) => res.send('Hello World!'))

// app.listen(port, () => console.log(`Example app listening on port ${port}!`))
httpServer.listen(port, () => console.log(`Server listening on port ${port}!`));

