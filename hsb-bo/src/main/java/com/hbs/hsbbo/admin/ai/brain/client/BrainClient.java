package com.hbs.hsbbo.admin.ai.brain.client;

import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainChatRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainIngestRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainChatResponse;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainIngestResponse;

public interface BrainClient {
    BrainChatResponse chat(BrainChatRequest request);

    BrainIngestResponse ingest(BrainIngestRequest request);


}
