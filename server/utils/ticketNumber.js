import { Ticket } from '../models/Ticket.js';

/**
 * Generates the next sequential ticket number like SD-1006.
 * Uses numeric collation to find the actual highest existing ticket number,
 * rather than relying on createdAt which can vary if data was seeded or backdated.
 */
export const generateNextTicketNumber = async () => {
  let highestNum = 1000;

  try {
    // Find the ticket with the highest numerical ticket number
    const highestTicket = await Ticket.findOne(
      { ticketNumber: /^SD-\d+$/ },
      { ticketNumber: 1 }
    )
      .collation({ locale: 'en', numericOrdering: true })
      .sort({ ticketNumber: -1 });

    if (highestTicket && highestTicket.ticketNumber) {
      const match = highestTicket.ticketNumber.match(/^SD-(\d+)$/);
      if (match && match[1]) {
        highestNum = Math.max(highestNum, parseInt(match[1], 10));
      }
    }
  } catch {
    // Fallback: scan existing SD- tickets
    const tickets = await Ticket.find(
      { ticketNumber: /^SD-\d+$/ },
      { ticketNumber: 1 }
    ).lean();

    for (const t of tickets) {
      const match = t.ticketNumber?.match(/^SD-(\d+)$/);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
        }
      }
    }
  }

  // Ensure candidate number is strictly unused
  let nextNum = highestNum + 1;
  let candidate = `SD-${nextNum}`;

  while (await Ticket.exists({ ticketNumber: candidate })) {
    nextNum += 1;
    candidate = `SD-${nextNum}`;
  }

  return candidate;
};

