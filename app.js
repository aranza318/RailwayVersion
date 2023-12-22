import express from "express";
import Handlebars from "handlebars";
import expressHandlebars from "express-handlebars";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cartsRouter from "./src/routes/cart.routes.js";
import productsRouter from "./src/routes/product.routes.js";
import serviceRouter from "./src/routes/sessions.routes.js";
import viewsRouter from "./src/routes/views.routes.js";
import emailRouter from "./src/routes/email.routes.js";
import smsRouter from "./src/routes/sms.router.js";
import mockingRouter from "./src/moking/mock.router.js";
import logRouter from "./src/routes/log.routes.js";
import userRouter from "./src/routes/users.routes.js";
import paymentRouter from "./src/routes/payments.routes.js";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import session from "express-session";
import MongoStore from "connect-mongo";
import morgan from "morgan";
import initializePassport from "./src/midsIngreso/passport.js"
import initializeGitHubPassport from "./src/midsIngreso/github.js";
import passport from "passport";
import cookieParser from "cookie-parser";
import cors from "cors";
import { MONGODB_CNX_STR, PORT, SECRET_SESSIONS} from "./src/config/configs.js"
//import "./src/dao/dbConfig.js"
import { addLogger, devLogger } from "./src/config/logger.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUIExpress from "swagger-ui-express";

const app = express();

const port = PORT || 8080;
const httpServer = app.listen(port, () => {devLogger.info(`conectado a ${port}`)});

const mongoUrl = MONGODB_CNX_STR;
mongoose.connect(mongoUrl,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS:20000,
})
.then(()=> console.log('Conectado a la Base de Datos MongoDB'))
.catch(err => console.error('Error al conectar con MongoDB'))

//Server
export const socketServer = new Server(httpServer);

const swaggerOptions = {
  definition:{
    openapi:"3.0.1",
    info:{
      title: "Documentacion Api Okuna",
      description: "Documentacion para Swagger"
    }
  },

  apis: [`./src/docs/**/*.yaml`]
}

const specs =  swaggerJSDoc(swaggerOptions)


//Socket Server
app.set("socketServer", socketServer);

//Engine, rutas y mids
app.engine(
  "handlebars",
  expressHandlebars.engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");
app.use(express.static(__dirname));
app.use(cors({
  credentials:true,
  method: ["GET", "POST", "PUT", "DELETE"]
}))
app.use(cookieParser());
app.use('/apidocs', swaggerUIExpress.serve, swaggerUIExpress.setup(specs));
app.use(session({
  store: new MongoStore({
      mongoUrl: MONGODB_CNX_STR,
      collectionName:"sessions"
  }),
  secret: SECRET_SESSIONS,
  resave: false,
  saveUninitialized: false,
  cookie: {secure:false}
}))
initializeGitHubPassport();    initializePassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname+"/src/public"));
app.use("/images", express.static(__dirname+ "/src/public/images"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(addLogger);
app.use(morgan('dev'))
app.use("/api/products/", productsRouter);
app.use("/api/carts/", cartsRouter);
app.use("/api/sessions/", serviceRouter);
app.use("/api/email", emailRouter);
app.use("/api/sms", smsRouter);
app.use("/api/users", userRouter)
app.use('/mockingproducts', mockingRouter);
app.use("/", viewsRouter);
app.use('/loggerTest', logRouter);
app.use("/payment", paymentRouter);


//Managers
import ProductManager from "./src/dao/ProductManager.js";
const PM = new ProductManager();

import MessagesManager from "./src/dao/messagesmanager.js";
const MM = new MessagesManager();

import CartManager from "./src/dao/cartManager.js";
import { error } from "winston";
const CM = new CartManager();


//Sockets on 
socketServer.on("connection", async (socket) => {
  console.log("Un cliente se ha conectado");

  const allProducts = await PM.getProducts();
  socket.emit("initial_products", allProducts.payload);

  socket.on("addProduct", async(obj)=>{
    await PM.addProduct(obj);
    const listadeproductos = await PM.getProductsViews();
    socketServer.emit("envioDeProductos", listadeproductos);    
});

  socket.on("deleteProduct",async(id)=>{
    console.log(id);
    const listadeproductos=await PM.getProductsViews();
    
    await PM.deleteProduct(id);
    
    socketServer.emit("envioDeProducts", listadeproductos);
    });

  socket.on("eliminarProducto", (data)=>{
    PM.deleteProduct(parseInt(data));
    const listadeproductos = PM.getProducts();
    socketServer.emit("envioDeProducts", listadeproductos);
  });

  socket.on("nuevoUsuario",(usuario)=>{
    console.log("usuario", usuario);
    socket.broadcast.emit("broadcast", usuario);
    });

  socket.on("disconnect", ()=>{
    console.log("Usuario desconectado");
    });

  socket.on("mensaje", async (info) =>{
    console.log(info);
    await MM.createMessage(info);
    socketServer.emit("chat", await MM.getMessages());
});
});



