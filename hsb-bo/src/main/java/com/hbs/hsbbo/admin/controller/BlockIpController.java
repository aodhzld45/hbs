package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.aop.AdminActionLog;
import com.hbs.hsbbo.admin.dto.request.BlockIpRequest;
import com.hbs.hsbbo.admin.dto.response.BlockIpListResponse;
import com.hbs.hsbbo.admin.dto.response.BlockIpResponse;
import com.hbs.hsbbo.admin.service.BlockIpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/admin/block-ips")
@RequiredArgsConstructor
@Validated
public class BlockIpController {

    private final BlockIpService blockIpService;

    @GetMapping("/active")
    public ResponseEntity<List<BlockIpResponse>> findAllActive() {
        List<BlockIpResponse> items = blockIpService.findAllActive().stream()
                .map(BlockIpResponse::from)
                .toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlockIpResponse> findActiveById(@PathVariable Long id) {
        return ResponseEntity.ok(blockIpService.findActiveById(id));
    }

    @GetMapping
    public ResponseEntity<BlockIpListResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "regDate,desc") String sort
    ) {
        return ResponseEntity.ok(blockIpService.list(keyword, page, size, sort));
    }

    @AdminActionLog(action = "BlockIP CREATE", detail = "ipAddress={ipAddress}")
    @PostMapping
    public ResponseEntity<IdResponse> create(
            @Valid @RequestBody BlockIpRequest req,
            @RequestParam String actor
    ) {
        Long id = blockIpService.create(req, actor);
        return ResponseEntity.created(URI.create("/api/admin/block-ips/" + id))
                .body(new IdResponse(id));
    }

    @AdminActionLog(action = "BlockIP UPDATE", detail = "id={id}")
    @PatchMapping("/{id}")
    public ResponseEntity<IdResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody BlockIpRequest req,
            @RequestParam String actor
    ) {
        Long updatedId = blockIpService.update(id, req, actor);
        return ResponseEntity.ok(new IdResponse(updatedId));
    }

    @AdminActionLog(action = "BlockIP USE_TF", detail = "id={id}, newUseTf={newUseTf}")
    @PatchMapping("/{id}/use-tf")
    public ResponseEntity<IdResponse> updateUseTf(
            @PathVariable Long id,
            @RequestParam String newUseTf,
            @RequestParam String actor
    ) {
        Long updatedId = blockIpService.updateUseTf(id, newUseTf, actor);
        return ResponseEntity.ok(new IdResponse(updatedId));
    }

    @AdminActionLog(action = "BlockIP DELETE", detail = "id={id}")
    @PatchMapping("/{id}/del-tf")
    public ResponseEntity<IdResponse> softDelete(
            @PathVariable Long id,
            @RequestParam String actor
    ) {
        Long deletedId = blockIpService.deleteBlockIp(id, actor);
        return ResponseEntity.ok(new IdResponse(deletedId));
    }

    public record IdResponse(Long id) {}
}
