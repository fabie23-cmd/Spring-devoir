package com.example.gestioncommande.repository;

import com.example.gestioncommande.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
    boolean existsByTelephone(String telephone);
}