package com.hbs.hsbbo.user.ai.controller;

import com.hbs.hsbbo.user.ai.dto.SoraGetResponse;
import com.hbs.hsbbo.user.ai.service.SoraService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {
    private final SoraService sora;
    //private final VideoJobRepository repo;


    @GetMapping("/{id}")
    public SoraGetResponse status(@PathVariable String id) {
        return sora.getStatus(id);
    }



//    @PostMapping
//    public Map<String,Object> create(@RequestBody CreateVideoRequest req, Principal me) {
//        String jobId = sora.createJob(req);
//        repo.save(VideoJob.of(jobId, req, me.getName()));
//        return Map.of("jobId", jobId);
//    }


}
