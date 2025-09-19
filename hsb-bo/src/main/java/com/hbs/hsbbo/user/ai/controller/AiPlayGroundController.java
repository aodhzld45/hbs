package com.hbs.hsbbo.user.ai.controller;

import com.hbs.hsbbo.user.ai.dto.ChatRequest;
import com.hbs.hsbbo.user.ai.dto.ChatResponse;
import com.hbs.hsbbo.user.ai.service.OpenAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiPlayGroundController {
    private final OpenAiService openAiService;

    @PostMapping("/complete")
    public ChatResponse complete(@RequestBody ChatRequest req) {
        if (req.getPrompt() == null || req.getPrompt().isBlank()) {
            throw new IllegalArgumentException("prompt is required");
        }
        return openAiService.chatBlocking(req);
    }


}
