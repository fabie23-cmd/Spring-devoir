package com.example.gestioncommande.controller;

import com.example.gestioncommande.dto.ClientCommandeDTO;
import com.example.gestioncommande.model.Client;
import com.example.gestioncommande.model.Commande;
import com.example.gestioncommande.repository.ClientRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/clients")
public class ClientController {
    private final ClientRepository clientRepository;
    
    public ClientController(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }
    
    @PostMapping("/{id}/commandes")
    public ResponseEntity<?> createClientWithOrders(@Valid @RequestBody Client client) {
        if (client.getCommandes() == null || client.getCommandes().isEmpty()) {
            return ResponseEntity.badRequest().body("Au moins une commande est requise");
        }
        
        if (clientRepository.existsByTelephone(client.getTelephone())) {
            return ResponseEntity.badRequest().body("Ce numéro de téléphone existe déjà");
        }
        
        for (Commande commande : client.getCommandes()) {
            commande.setClient(client);
        }
        
        Client savedClient = clientRepository.save(client);
        return ResponseEntity.ok(savedClient);
    }
    
    @GetMapping("/{id}/commandes")
    public ResponseEntity<Map<String, Object>> getClientOrders(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        
        Page<Commande> commandePage = PageRequest.of(page, size);
        
        ClientCommandeDTO clientDTO = new ClientCommandeDTO();
        clientDTO.setNomComplet(client.getNomComplet());
        clientDTO.setTelephone(client.getTelephone());
        
        Map<String, Object> response = new HashMap<>();
        response.put("results", Collections.singletonList(clientDTO));
        
        return ResponseEntity.ok(response);
    }
}