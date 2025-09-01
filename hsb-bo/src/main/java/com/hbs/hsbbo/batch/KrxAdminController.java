package com.hbs.hsbbo.batch;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/krx") @RequiredArgsConstructor
public class KrxAdminController {
    private final KrxSymbolBatch batch;
    @PostMapping("/refresh") public String refresh() { batch.run(); return "OK"; }
}
