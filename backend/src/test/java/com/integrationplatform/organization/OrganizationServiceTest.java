package com.integrationplatform.organization;

import com.integrationplatform.audit.service.AuditService;
import com.integrationplatform.auth.model.User;
import com.integrationplatform.auth.repository.UserRepository;
import com.integrationplatform.common.exception.ForbiddenException;
import com.integrationplatform.organization.dto.CreateOrganizationRequest;
import com.integrationplatform.organization.dto.OrganizationResponse;
import com.integrationplatform.organization.model.MemberRole;
import com.integrationplatform.organization.model.Organization;
import com.integrationplatform.organization.model.OrganizationMember;
import com.integrationplatform.organization.repository.OrganizationMemberRepository;
import com.integrationplatform.organization.repository.OrganizationRepository;
import com.integrationplatform.organization.service.OrganizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrganizationServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private OrganizationMemberRepository memberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    private OrganizationService organizationService;

    @BeforeEach
    void setUp() {
        organizationService = new OrganizationService(
            organizationRepository,
            memberRepository,
            userRepository,
            auditService
        );
    }

    @Test
    void testCreateOrganization_AssignsOwner() {
        UUID userId = UUID.randomUUID();
        User user = new User("owner@example.com", "hash");
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(organizationRepository.existsBySlug("acme-technologies")).thenReturn(false);
        when(organizationRepository.save(any(Organization.class))).thenAnswer(i -> {
            Organization org = i.getArgument(0);
            org.setId(UUID.randomUUID());
            return org;
        });

        OrganizationResponse response = organizationService.createOrganization(
            userId,
            new CreateOrganizationRequest("Acme Technologies")
        );

        assertNotNull(response);
        assertEquals("Acme Technologies", response.name());
        assertEquals("acme-technologies", response.slug());
        assertEquals(MemberRole.OWNER, response.currentUserRole());

        verify(memberRepository).saveAndFlush(argThat(m -> m.getRole() == MemberRole.OWNER && m.getUser().equals(user)));
    }

    @Test
    void testGetOrganization_TenantIsolation_DeniedForNonMember() {
        UUID orgId = UUID.randomUUID();
        UUID strangerUserId = UUID.randomUUID();

        when(memberRepository.findByOrganizationIdAndUserId(orgId, strangerUserId)).thenReturn(Optional.empty());

        assertThrows(ForbiddenException.class, () -> organizationService.getOrganization(orgId, strangerUserId));
    }
}
