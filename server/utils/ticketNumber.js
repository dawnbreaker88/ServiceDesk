import { Ticket } from '../models/Ticket.js';

/**
 * Generates the next sequential ticket number like SD-1007
 */
export const generateNextTicketNumber = async () => {
  const lastTicket = await Ticket.findOne({}, {}, { sort: { createdAt: -1 } });
  if (!lastTicket || !lastTicket.ticketNumber) {
    return 'SD-1001';
  }

  const match = lastTicket.ticketNumber.match(/SD-(\d+)/);
  if (match && match[1]) {
    const nextNum = parseInt(match[1], 10) + 1;
    return `SD-${nextNum}`;
  }

  return `SD-${Date.now().toString().slice(-4)}`;
};
