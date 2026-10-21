package com.example.back_end.dtos.ticket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketStatisticsResponse {

    private long totalTickets;
    private long openTickets;
    private long inProgressTickets;
    private long criticalTickets;
}