package com.example.gestioncommande.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
@Entity
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Le nom complet est obligatoire")
    private String nomComplet;
    
    @NotBlank(message = "Le téléphone est obligatoire")
    @Column(unique = true)
    private String telephone;
    
    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL)
    private List<Commande> commandes;
}