package com.hbs.hsbbo.admin.ai.brain.client;

import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainChatRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainDeleteIndexRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainIngestRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainVectorStoreCreateRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainChatResponse;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainDeleteIndexResponse;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainHealthResponse;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainIngestResponse;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainVectorStoreCreateResponse;

public interface BrainClient {
    BrainHealthResponse health();

    BrainChatResponse chat(BrainChatRequest request);

    BrainIngestResponse ingest(BrainIngestRequest request);

    BrainDeleteIndexResponse deleteIndex(BrainDeleteIndexRequest request);

    BrainVectorStoreCreateResponse createVectorStore(BrainVectorStoreCreateRequest request);
}
