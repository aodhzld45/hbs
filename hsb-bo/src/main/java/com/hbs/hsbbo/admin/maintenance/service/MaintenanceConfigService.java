package com.hbs.hsbbo.admin.maintenance.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbs.hsbbo.admin.maintenance.dto.MaintenanceRuleDto;
import com.hbs.hsbbo.admin.maintenance.dto.request.MaintenanceConfigRequest;
import com.hbs.hsbbo.admin.maintenance.model.MaintenanceConfig;
import com.hbs.hsbbo.common.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.file.*;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.regex.Pattern;

/**
 * DB 없이 파일(JSON)로 maintenance-config를 저장/로드하는 서비스
 * - 저장 위치: {uploadPath}/maintenance/maintenance-routes.json
 */
@Service
@RequiredArgsConstructor
public class MaintenanceConfigService {

    private final ObjectMapper objectMapper;
    private final FileUtil fileUtil;

    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    private static final String SUB_DIR = "maintenance";
    private static final String FILE_NAME = "maintenance-routes.json";

    private Path configFilePath() {
        // 공용 resolvePath 사용
        return fileUtil.resolvePath(SUB_DIR).resolve(FILE_NAME);
    }

    public MaintenanceConfig load() {
        lock.readLock().lock();
        try {
            Path p = configFilePath();
            if (!Files.exists(p)) {
                return MaintenanceConfig.defaultConfig();
            }
            String json = Files.readString(p);
            return objectMapper.readValue(json, MaintenanceConfig.class);
        } catch (Exception e) {
            // 파일 깨짐/파싱 실패 시 안전하게 기본값 반환
            return MaintenanceConfig.defaultConfig();
        } finally {
            lock.readLock().unlock();
        }
    }

    public MaintenanceConfig save(MaintenanceConfigRequest req) {
        lock.writeLock().lock();
        try {
            validate(req);

            MaintenanceConfig model = MaintenanceConfig.from(req);

            Path p = configFilePath();
            Files.createDirectories(p.getParent());

            String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(model);
            writeTextAtomic(p, json);

            return model;
        } catch (RuntimeException re) {
            throw re;
        } catch (Exception e) {
            throw new RuntimeException("점검 설정 저장 실패", e);
        } finally {
            lock.writeLock().unlock();
        }
    }

    // 기본 검증: 중복 id, matchType/type 값, REGEX 컴파일
    private void validate(MaintenanceConfigRequest req) {
        int sec = req.getPollIntervalSec() == null ? 15 : req.getPollIntervalSec();
        if (sec < 5) {
            throw new IllegalArgumentException("pollIntervalSec는 최소 5초 이상이어야 합니다.");
        }

        Set<String> ids = new HashSet<>();
        for (MaintenanceRuleDto r : req.getRules()) {
            if (!ids.add(r.getId())) {
                throw new IllegalArgumentException("rule id 중복: " + r.getId());
            }

            String mt = r.getMatchType();
            if (!Set.of("EXACT", "PREFIX", "REGEX").contains(mt)) {
                throw new IllegalArgumentException("matchType 오류: " + mt);
            }

            String type = r.getType();
            if (!Set.of("MAINTENANCE", "COMING_SOON", "NOTICE").contains(type)) {
                throw new IllegalArgumentException("type 오류: " + type);
            }

            if ("REGEX".equals(mt)) {
                try {
                    Pattern.compile(r.getPath());
                } catch (Exception e) {
                    throw new IllegalArgumentException("REGEX 패턴 오류: " + r.getPath());
                }
            }
        }
    }

    // 파일 깨짐 방지: tmp로 쓰고 replace move (가능하면 atomic)
    private void writeTextAtomic(Path target, String content) throws Exception {
        Path tmp = target.resolveSibling(target.getFileName().toString() + ".tmp");
        Files.writeString(tmp, content, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        try {
            Files.move(tmp, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } catch (AtomicMoveNotSupportedException e) {
            Files.move(tmp, target, StandardCopyOption.REPLACE_EXISTING);
        }
    }
}
