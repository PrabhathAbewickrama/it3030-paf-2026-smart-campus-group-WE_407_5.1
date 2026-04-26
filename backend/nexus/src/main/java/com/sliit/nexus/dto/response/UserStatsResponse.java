package com.sliit.nexus.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserStatsResponse {
    private long totalUsers;
    private long admins;
    private long managers;
    private long technicians;
    private long students;
}
