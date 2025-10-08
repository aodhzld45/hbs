package com.hbs.hsbbo.user.ai.service;

import com.hbs.hsbbo.user.ai.dto.CreateVideoRequest;
import com.hbs.hsbbo.user.ai.dto.SoraCreateResponse;
import com.hbs.hsbbo.user.ai.dto.SoraGetResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class SoraService {
    private final WebClient http = WebClient.builder()
            .baseUrl("https://api.openai.com/v1/videos") // 가이드 문서 경로 참고
            .defaultHeader("Authorization", "Bearer " + System.getenv("OPENAI_API_KEY"))
            .build();

    public String createJob(CreateVideoRequest req) {
        Map<String,Object> body = Map.of(
                "prompt", req.prompt(),
                "aspect_ratio", req.aspect(),       // e.g. "16:9" | "9:16"
                "duration", req.durationSec(),      // e.g. 10, 20
                "resolution", req.resolution()      // e.g. "1080p"
        );
        SoraCreateResponse resp = http.post().uri("/generations")
                .bodyValue(body)
                .retrieve().bodyToMono(SoraCreateResponse.class).block();
        return resp.id();
    }

    public SoraGetResponse getStatus(String jobId) {
        return http.get().uri("/generations/{id}", jobId)
                .retrieve().bodyToMono(SoraGetResponse.class).block();
    }
}
