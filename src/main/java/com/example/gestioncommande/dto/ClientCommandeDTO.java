package com.example.gestioncommande.dto;

import lombok.Data;
import java.util.List;

@Data
public class ClientCommandeDTO {
    private String nomComplet;
    private String telephone;
    private List<CommandeDTO> commandes;
}