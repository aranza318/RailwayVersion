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

async getTicketById(tid) {

  if (!tid) throw new Error('Ticket ID is required.');

  const tickets = await this.ticketManager.getTicketById(tid);
  return tickets;
}
}

export default TicketService;

