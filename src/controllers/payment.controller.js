import Stripe from "stripe";
import cartController from "./cart.controller.js";
import { STRIPE_KEY } from "../config/configs.js";

const stripe = new Stripe(STRIPE_KEY);

export const crearPago = async (req, res)=>{
    const cartId = req.body.cartId;
    if (!cartId){
        return res.status(400).json({error: "El ID del carrito es requerido"})
    }
    try {
        const cart = await cartController.getCartByID(cartId);
        if(!cart || !cart.products ||!cart.products.length===0){
            throw new Error("Carrito vacio o no encontrado");
        }
        const itemsIn = cart.products.map((item)=>{
            if(!item.product.price || !item.product){
                throw new Error("Producto no valido");
            }
        const precioPorUnidad = Math.round(item.product.price*100);
        if(isNaN(precioPorUnidad)){
            throw new Error("Precio invalido para el producto seleccionado")
        } 
        return{
            price_data:{
            currency:"usd",
            product_data:{name:item.product.title},
            unit_amount: precioPorUnidad,
            },
            quantity:item.quantity,
        }
        });
        const session = await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            line_items:itemsIn,
            mode:"payment",
            success_url: `http://localhost:8080/payment/payment-success?session_id={CHECKOUT_SESSION_ID}&cart_id=${cartId}`,
            cancel_url:
              "http://localhost:8080/cancel",
        });
        res.json(session);
    } catch (error) {
        console.error("Error al crear la sesion de pago: ", error);
        res.status(500).send("Error interno del servidor");
    }
}

export const handlePaymentSuccess = async (req, res)=>{
    const sessionId = req.query.session_id;
    const cartId = req.query.cart_id;
    const emailUser = req.session.user.email;
    if(!sessionId || !cartId){
        return res.status(400).send("Parametros requeridos en falta");
    }
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if(session.payment_status==="paid"){
            try {
                const result = await cartController.createPurchaseTicket(cartId,emailUser);
                if(result.success){
                    return res.redirect(`/ticket-detail/${result.ticketId}`)
                } else {
                    return res.status(500).send("Error al crear el ticket");
                }
            } catch (error) {
                console.error("Error al procesar el pago", error)
                return res.status(500).send("Error interno del servidor");
            }
        } else {
            return res.status(400).send("No se pudo completar el pago con exito");
        }
    } catch (error) {
        console.error("Error al procesar el pago: ", error);
        return res.status(500).send("Error interno del servidor")
    }
}