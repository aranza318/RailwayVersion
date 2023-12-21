import { Router } from "express";
import { handlePaymentSuccess, crearPago } from "../controllers/payment.controller.js";

const paymentRouter = Router();

paymentRouter.post("/create-checkout-session", crearPago);
paymentRouter.get("/payment-success", handlePaymentSuccess);
paymentRouter.get("/cancel", (req, res) => {});

export default paymentRouter;