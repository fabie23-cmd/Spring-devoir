package com.example.gestioncommande.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
public class Commande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private LocalDate date;
    private BigDecimal montant;
    
    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;
}