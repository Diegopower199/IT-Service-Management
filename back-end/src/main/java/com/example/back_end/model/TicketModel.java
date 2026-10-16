package com.example.back_end.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TicketModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ticket", nullable = false)
    private Long idTicket;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;

    @ManyToOne
    @JoinColumn(name = "id_created_by", nullable = false, foreignKey = @ForeignKey(name = "FK_ticket_created_by"))
    private UserModel createdBy;

    @ManyToOne
    @JoinColumn(name = "id_requested_for", nullable = false, foreignKey = @ForeignKey(name = "FK_ticket_requested_for"))
    private UserModel requestedFor;

    @ManyToOne
    @JoinColumn(name = "id_assigned_to", nullable = true, foreignKey = @ForeignKey(name = "FK_ticket_assigned_to"))
    private UserModel assignedTo;

    @ManyToOne
    @JoinColumn(name = "id_category", nullable = false, foreignKey = @ForeignKey(name = "FK_ticket_category"))
    private CategoryModel category;

    @ManyToOne
    @JoinColumn(name = "id_priority", nullable = false, foreignKey = @ForeignKey(name = "FK_ticket_priority"))
    private PriorityModel priority;

    @ManyToOne
    @JoinColumn(name = "id_status", nullable = false, foreignKey = @ForeignKey(name = "FK_ticket_status"))
    private StatusModel status;
}
