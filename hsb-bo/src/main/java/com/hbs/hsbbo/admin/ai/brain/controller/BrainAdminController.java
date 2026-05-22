package com.hbs.hsbbo.admin.ai.brain.controller;

import com.hbs.hsbbo.admin.ai.brain.client.BrainClient;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainHealthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/ai/brain")
public class BrainAdminController {

    private final BrainClient brainClient;

    @GetMapping("/health")
    public ResponseEntity<BrainHealthResponse> health() {
        return ResponseEntity.ok(brainClient.health());
    }
}
