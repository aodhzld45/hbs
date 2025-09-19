package com.hbs.hsbbo.user.ai.service;

import com.hbs.hsbbo.user.ai.dto.ChatRequest;
import com.hbs.hsbbo.user.ai.dto.ChatResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OpenAiService {

    @Qualifier("openAiWebClient")
    private final WebClient openAiWebClient;

    @Value("${openai.model:gpt-4o-mini}")
    private String defaultModel;

    public Mono<ChatResponse> chat(ChatRequest req) {
        String model = (req.getModel() == null || req.getModel().isBlank())
                ? defaultModel : req.getModel();

        var msgs = new java.util.ArrayList<Map<String,Object>>();
        msgs.add(Map.of("role", "system",
                "content", (req.getSystem() != null && !req.getSystem().isBlank())
                        ? req.getSystem()
                        : "You are a helpful assistant."));

        if (req.getContext() != null && !req.getContext().isBlank()) {
            msgs.add(Map.of("role", "user",
                    "content", "Context:\n" + req.getContext()));
        }
        msgs.add(Map.of("role", "user",
                "content", (req.getPrompt() == null ? "" : req.getPrompt())));

        var body = Map.of(
                "model", model,
                "messages", msgs,
                "temperature", req.getTemperature() == null ? 0.3 : req.getTemperature(),
                "max_tokens", req.getMaxTokens() == null ? 600 : req.getMaxTokens()
        );

        return openAiWebClient.post()
                .uri("/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .map(res -> {
                    var choices = (List<Map<String,Object>>) res.get("choices");
                    String text = "";
                    if (choices != null && !choices.isEmpty()) {
                        var msg = (Map<String,Object>) choices.get(0).get("message");
                        text = String.valueOf(msg.get("content"));
                    }
                    var usage = (Map<String,Object>) res.get("usage");
                    Integer promptT = usage == null ? null : (Integer) usage.get("prompt_tokens");
                    Integer complT  = usage == null ? null : (Integer) usage.get("completion_tokens");
                    Integer totalT  = usage == null ? null : (Integer) usage.get("total_tokens");
                    String usedModel = (String) res.get("model");

                    return ChatResponse.builder()
                            .model(usedModel == null ? model : usedModel)
                            .text(text)
                            .inputTokens(promptT)
                            .outputTokens(complT)
                            .totalTokens(totalT)
                            .build();
                });
    }

    /**
     * MVC 환경에서 간단히 동기 호출하고 싶을 때 사용
     */
    public ChatResponse chatBlocking(ChatRequest req) {
        return chat(req).block(Duration.ofSeconds(30));
    }
}
