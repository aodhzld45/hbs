// src/main/java/com/hbs/hsbbo/common/controller/CodeController.java
package com.hbs.hsbbo.common.controller;

import com.hbs.hsbbo.common.dto.request.CodeParentRequest;
import com.hbs.hsbbo.common.dto.request.CodeDetailRequest;
import com.hbs.hsbbo.common.dto.response.CodeParentResponse;
import com.hbs.hsbbo.common.dto.response.CodeDetailResponse;
import com.hbs.hsbbo.common.service.CodeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/common/codes")
public class CodeController {

    private final CodeService svc;

    public CodeController(CodeService svc) {
        this.svc = svc;
    }

    // 대분류 ------------------------------------------------
    @GetMapping("/parents")
    public List<CodeParentResponse> listParents() {
        return svc.listParents();
    }

    @PostMapping("/parent")
    public ResponseEntity<CodeParentResponse> createParent(
            @Valid @RequestBody CodeParentRequest req
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(svc.createParent(req));
    }

    @PutMapping("/parent/{id}")
    public CodeParentResponse updateParent(
            @PathVariable Integer id,
            @Valid @RequestBody CodeParentRequest req
    ) {
        return svc.updateParent(id, req);
    }

    @DeleteMapping("/parent/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteParent(@PathVariable Integer id) {
        svc.deleteParent(id);
    }

    // 하위 --------------------------------------------------
    @GetMapping("/{pcode}/details")
    public List<CodeDetailResponse> listDetails(@PathVariable String pcode) {
        return svc.listDetails(pcode);
    }

    @PostMapping("/{pcode}/detail")
    public ResponseEntity<CodeDetailResponse> createDetail(
            @PathVariable String pcode,
            @Valid @RequestBody CodeDetailRequest req
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(svc.createDetail(pcode, req));
    }

    @PutMapping("/{pcode}/detail/{dcodeNo}")
    public CodeDetailResponse updateDetail(
            @PathVariable String pcode,
            @PathVariable Integer dcodeNo,
            @Valid @RequestBody CodeDetailRequest req
    ) {
        return svc.updateDetail(pcode, dcodeNo, req);
    }

    @DeleteMapping("/{pcode}/detail/{dcodeNo}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDetail(
            @PathVariable String pcode,
            @PathVariable Integer dcodeNo
    ) {
        svc.deleteDetail(pcode, dcodeNo);
    }
}
