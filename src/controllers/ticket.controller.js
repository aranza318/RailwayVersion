import TicketService from "../services/tickets.service.js";


class TicketController {
  constructor() {
    this.ticketService = new TicketService();
  }

 async createTicket(ticketData) {
    if(!ticketData){
        console.error('Datos del ticket en falta');
        throw new Error('Datos del ticket en falta');
    }
    try {
        
        const ticket = await this.ticketService.createTicket(ticketData);
        if (ticket) {
            return ticket;
        } else {
            throw new Error('Error creando el ticket')
        }

    } catch (error) {
       console.log('Error al crear el ticket: ', error);  
    }
    }
     
    async getTicketDetail (ticketId){
    
        try {
            const ticket = await this.ticketService.getTicketById(ticketId);
           
            if(!ticket){
                throw new Error ("No se encontro el ticket");
            } 
            return ticket;
        } catch (error) {
            console.error("El ticket solicitado no se encuentra disponible");
            throw error;           
        }
    }


}
export default new TicketController();