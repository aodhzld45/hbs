package com.hbs.hsbbo.user.ai.service;

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
    private String model;

    public Mono<String> generateDraft(String context, String query) {
        var body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "You generate polite, accurate draft replies for customer support. " +
                                        "Use only the provided company context; if unsure, ask for clarification."),
                        Map.of("role", "user", "content",
                                "Company Context:\n" + context + "\n\nCustomer Message:\n" + query +
                                        "\n\nReturn a concise answer suitable for the customer.")
                ),
                "temperature", 0.3
        );

        return openAiWebClient.post()
                .uri("/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .map(res -> {
                    var choices = (List<Map<String,Object>>) res.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        var msg = (Map<String,Object>) choices.get(0).get("message");
                        return String.valueOf(msg.get("content"));
                    }
                    return "(no draft)";
                });
    }

    /** MVC 환경에서 간단히 동기 호출하고 싶을 때 사용 */
    public String generateDraftBlocking(String context, String query) {
        return generateDraft(context, query).block(Duration.ofSeconds(30));
    }
}
