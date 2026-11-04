package com.integrationplatform.webhook;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.integrationplatform.organization.model.Organization;
import com.integrationplatform.project.model.Project;
import com.integrationplatform.project.repository.ProjectRepository;
import com.integrationplatform.webhook.dto.CreateWebhookRequest;
import com.integrationplatform.webhook.dto.WebhookResponse;
import com.integrationplatform.webhook.model.Webhook;
import com.integrationplatform.webhook.repository.WebhookDeliveryRepository;
import com.integrationplatform.webhook.repository.WebhookRepository;
import com.integrationplatform.webhook.service.WebhookDispatcherService;
import com.integrationplatform.webhook.service.WebhookSignatureService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebhookDispatcherServiceTest {

    @Mock
    private WebhookRepository webhookRepository;

    @Mock
    private WebhookDeliveryRepository deliveryRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private WebhookSignatureService signatureService;

    private WebhookDispatcherService dispatcherService;
    private Project testProject;
    private UUID projectId;

    @BeforeEach
    void setUp() {
        dispatcherService = new WebhookDispatcherService(
            webhookRepository,
            deliveryRepository,
            projectRepository,
            signatureService,
            new ObjectMapper()
        );

        Organization org = new Organization("Test Org", "test-org");
        testProject = new Project(org, "Production App", "production-app");
        testProject.setId(UUID.randomUUID());
        projectId = testProject.getId();
    }

    @Test
    void testCreateWebhook_GeneratesSecretAndPersists() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(webhookRepository.save(any(Webhook.class))).thenAnswer(inv -> {
            Webhook w = inv.getArgument(0);
            w.setId(UUID.randomUUID());
            return w;
        });

        CreateWebhookRequest req = new CreateWebhookRequest(
            "https://myapp.com/webhooks/incoming",
            List.of("connection.created", "execution.succeeded")
        );

        WebhookResponse response = dispatcherService.createWebhook(projectId, req);

        assertNotNull(response);
        assertNotNull(response.id());
        assertEquals("https://myapp.com/webhooks/incoming", response.url());
        assertTrue(response.secret().startsWith("whsec_"), "Generated secret must start with whsec_ prefix");
        assertEquals(2, response.events().size());
        assertTrue(response.isActive());

        verify(webhookRepository).save(any(Webhook.class));
    }

    @Test
    void testDeleteWebhook_DeletesWhenFound() {
        UUID webhookId = UUID.randomUUID();
        Webhook webhook = new Webhook(testProject, "https://example.com/wh", "whsec_123", "*");
        webhook.setId(webhookId);

        when(webhookRepository.findByIdAndProjectId(webhookId, projectId)).thenReturn(Optional.of(webhook));

        dispatcherService.deleteWebhook(webhookId, projectId);

        verify(webhookRepository).delete(webhook);
    }

    @Test
    void testListWebhooks_ReturnsProjectWebhooks() {
        Webhook w1 = new Webhook(testProject, "https://url1.com", "whsec_1", "connection.created");
        w1.setId(UUID.randomUUID());

        when(webhookRepository.findByProjectId(projectId)).thenReturn(List.of(w1));

        List<WebhookResponse> list = dispatcherService.listWebhooks(projectId);

        assertEquals(1, list.size());
        assertEquals("https://url1.com", list.get(0).url());
    }
}
