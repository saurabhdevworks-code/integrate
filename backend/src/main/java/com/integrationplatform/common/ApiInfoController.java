package com.integrationplatform.common;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiInfoController {
    @GetMapping("/info")
    public Map<String, String> info() {
        return Map.of(
            "name", "Integration Platform",
            "status", "STARTER",
            "message", "Milestone 1 foundation initialized; see PROGRESS_REPORT.md"
        );
    }
}
