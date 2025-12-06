package com.hbs.hsbbo.admin.ai.brain.client;

import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainChatRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainChatResponse;

public interface BrainClient {
    BrainChatResponse chat(BrainChatRequest request);
}
