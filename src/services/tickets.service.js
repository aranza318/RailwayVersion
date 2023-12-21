import { ticketModel } from "../dao/models/ticket.model.js";
import TicketManager from "../dao/ticketManager.js";

class TicketService {
  constructor() {
    this.ticketManager = new TicketManager();
  }
  async createTicket(data) {
    console.log("Datos del ticket antes de crear:", data);

    if (
      !data.code ||
      !data.purchase_datetime ||
      !data.amount ||
      !data.purchaser
    ) {
      console.error("Datos incompletos:", data);
      throw new Error("Datos incompletos para crear el ticket.");
    }

    const ticket = new ticketModel(data);
    await ticket.save();
    console.log("Ticket creado:", ticket);
    return ticket;
  }
  async getTicketByOnlyCode(code){
    if (!code){
      throw new Error('El ID del ticket es requerido');
    }
    const tickets = await this.ticketManager.getTicketByCode(code);
    return tickets;
  }

  async createTickets(data){
    const { total, purchaser } = data;
    return this.ticketManager.createTicket({amount: total, purchaser: purchaser});
}

async getTicketById(ticketId) {
  try {
    const tickets = await ticketModel.findById(ticketId);
    if (!tickets) {
      console.error("El ticket seleccionado no pudo ser encontrado");
      return null;
    } 
    return tickets;
  } catch (error) {
    console.error("Error al buscar el ticket por su ID");
    throw error;
  }

}
}

export default TicketService;

