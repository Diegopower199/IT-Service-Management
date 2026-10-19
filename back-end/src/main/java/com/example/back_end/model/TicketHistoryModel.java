package com.example.back_end.model;

import java.time.LocalDateTime;

import com.example.back_end.enums.TicketHistoryAction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ticket_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TicketHistoryModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_history", nullable = false)
    private Long idHistory;

    @ManyToOne
    @JoinColumn(name = "id_ticket", nullable = false, foreignKey = @ForeignKey(name = "fk_ticket_history_ticket"))
    private TicketModel ticket;

    @ManyToOne
    @JoinColumn(name = "id_user", nullable = false, foreignKey = @ForeignKey(name = "fk_ticket_history_user"))
    private UserModel user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketHistoryAction action;

    @Column(name = "field_name")
    private String fieldName;

    @Column(name = "old_value")
    private String oldValue;

    @Column(name = "new_value")
    private String newValue;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}

/*
 * Action valores
 * TICKET_CREATED
 * STATUS_CHANGED
 * PRIORITY_CHANGED
 * CATEGORY_CHANGED
 * TITLE_CHANGED
 * DESCRIPTION_CHANGED
 * ASSIGNED
 * REASSIGNED
 */