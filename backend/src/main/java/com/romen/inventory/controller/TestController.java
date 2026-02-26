package com.romen.inventory.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/hello")
    public Map<String, String> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "API is working!");
        response.put("status", "SUCCESS");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return response;
    }
}