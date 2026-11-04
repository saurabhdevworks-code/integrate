package com.integrationplatform.organization.service;

import com.integrationplatform.audit.service.AuditService;
import com.integrationplatform.auth.model.User;
import com.integrationplatform.auth.repository.UserRepository;
import com.integrationplatform.common.exception.BadRequestException;
import com.integrationplatform.common.exception.ForbiddenException;
import com.integrationplatform.common.exception.ResourceNotFoundException;
import com.integrationplatform.organization.dto.AddMemberRequest;
import com.integrationplatform.organization.dto.CreateOrganizationRequest;
import com.integrationplatform.organization.dto.MemberResponse;
import com.integrationplatform.organization.dto.OrganizationResponse;
import com.integrationplatform.organization.model.MemberRole;
import com.integrationplatform.organization.model.Organization;
import com.integrationplatform.organization.model.OrganizationMember;
import com.integrationplatform.organization.repository.OrganizationMemberRepository;
import com.integrationplatform.organization.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public OrganizationService(
        OrganizationRepository organizationRepository,
        OrganizationMemberRepository memberRepository,
        UserRepository userRepository,
        AuditService auditService
    ) {
        this.organizationRepository = organizationRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public OrganizationResponse createOrganization(UUID userId, CreateOrganizationRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String baseSlug = generateSlug(request.name());
        String slug = baseSlug;
        int counter = 1;
        while (organizationRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        Organization org = new Organization(request.name().trim(), slug);
        Organization savedOrg = organizationRepository.save(org);

        OrganizationMember ownerMember = new OrganizationMember(savedOrg, user, MemberRole.OWNER);
        memberRepository.saveAndFlush(ownerMember);

        auditService.record(
            userId,
            savedOrg.getId(),
            "organization.created",
            "Organization",
            savedOrg.getId(),
            "{\"name\":\"" + savedOrg.getName() + "\"}"
        );

        return new OrganizationResponse(savedOrg.getId(), savedOrg.getName(), savedOrg.getSlug(), MemberRole.OWNER, savedOrg.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<OrganizationResponse> listUserOrganizations(UUID userId) {
        List<OrganizationMember> memberships = memberRepository.findByUserId(userId);
        return memberships.stream()
            .map(m -> new OrganizationResponse(
                m.getOrganization().getId(),
                m.getOrganization().getName(),
                m.getOrganization().getSlug(),
                m.getRole(),
                m.getOrganization().getCreatedAt()
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getOrganization(UUID orgId, UUID userId) {
        OrganizationMember membership = memberRepository.findByOrganizationIdAndUserId(orgId, userId)
            .orElseThrow(() -> new ForbiddenException("You do not have access to this organization"));

        Organization org = membership.getOrganization();
        return new OrganizationResponse(org.getId(), org.getName(), org.getSlug(), membership.getRole(), org.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> listMembers(UUID orgId, UUID userId) {
        boolean isMember = memberRepository.existsByOrganizationIdAndUserId(orgId, userId);
        if (!isMember) {
            throw new ForbiddenException("You do not have access to this organization's members");
        }

        return memberRepository.findByOrganizationId(orgId).stream()
            .map(m -> new MemberResponse(
                m.getId(),
                m.getUser().getId(),
                m.getUser().getEmail(),
                m.getRole(),
                m.getCreatedAt()
            ))
            .toList();
    }

    @Transactional
    public MemberResponse addMember(UUID orgId, UUID currentUserId, AddMemberRequest request) {
        OrganizationMember currentMember = memberRepository.findByOrganizationIdAndUserId(orgId, currentUserId)
            .orElseThrow(() -> new ForbiddenException("You do not have access to this organization"));

        if (currentMember.getRole() == MemberRole.MEMBER) {
            throw new ForbiddenException("Only owners and admins can invite members");
        }

        User targetUser = userRepository.findByEmailIgnoreCase(request.email())
            .orElseThrow(() -> new ResourceNotFoundException("No registered user found with email: " + request.email()));

        if (memberRepository.existsByOrganizationIdAndUserId(orgId, targetUser.getId())) {
            throw new BadRequestException("User is already a member of this organization");
        }

        Organization org = currentMember.getOrganization();
        OrganizationMember newMember = new OrganizationMember(org, targetUser, request.role());
        OrganizationMember saved = memberRepository.save(newMember);

        auditService.record(
            currentUserId,
            orgId,
            "organization.member_added",
            "OrganizationMember",
            saved.getId(),
            "{\"email\":\"" + targetUser.getEmail() + "\",\"role\":\"" + saved.getRole() + "\"}"
        );

        return new MemberResponse(saved.getId(), targetUser.getId(), targetUser.getEmail(), saved.getRole(), saved.getCreatedAt());
    }

    private String generateSlug(String input) {
        if (input == null) return "org";
        String normalized = input.trim().toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-");
        return normalized.isEmpty() ? "org" : (normalized.length() > 50 ? normalized.substring(0, 50) : normalized);
    }
}
