package com.hbs.hsbbo.admin.ai.brain.client;

import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainChatRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainIngestRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainVectorStoreCreateRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainChatResponse;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainIngestResponse;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainVectorStoreCreateResponse;

public interface BrainClient {
    BrainChatResponse chat(BrainChatRequest request);

    BrainIngestResponse ingest(BrainIngestRequest request);

    BrainVectorStoreCreateResponse createVectorStore(BrainVectorStoreCreateRequest request);



}
