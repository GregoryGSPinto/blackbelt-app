# BlackBelt v2 — Remaining Mock-Only Services Inventory

Generated: 2026-03-25

**Total services:** 227
**With real Supabase (.from/.rpc):** 193 (85%)
**Mock-only (no .from, no .rpc):** 34 (15%)

## Services by Category

### Tier A — Communication & Social (2)
| File | Functions | Table | Complexity |
|------|-----------|-------|------------|
| in-app-notification.service.ts | listNotifications, markAsRead, markAllRead, dismiss, getUnreadCount | notifications | SIMPLES |
| notification-hub.service.ts | sendNotification, resolveTemplate | notifications, notification_logs | MÉDIO |

### Tier B — Gamification & Content (3)
| File | Functions | Table | Complexity |
|------|-----------|-------|------------|
| teen-season.service.ts | getTeenSeasonPass, claimSeasonReward | xp_ledger, achievements, student_achievements | MÉDIO |
| teen.service.ts | getChallenges, getRanking, getAchievements, getProfile, getStreaks | xp_ledger, attendance, students, achievements | MÉDIO |
| student-analytics.service.ts | getStudentPerformance | attendance, evaluations, students | MÉDIO |

### Tier C — Video & Training (5)
| File | Functions | Table | Complexity |
|------|-----------|-------|------------|
| training-video.service.ts | uploadTrainingVideo, listTrainingVideos, getById | videos, content_videos | MÉDIO |
| video-analysis.service.ts | analyzeFrame, analyzeVideo, compareExecution | videos (AI — graceful fallback) | COMPLEXO |
| video-storage.service.ts | getStorageConfig, uploadVideo, getStats | storage_usage, academy_settings | MÉDIO |
| video-upload.service.ts | uploadVideo, deleteVideo | videos, content_videos | MÉDIO |
| periodization.service.ts | createMacrocycle, getMacrocycle, updatePhase | academy_settings JSONB | MÉDIO |

### Tier D — Admin Operations (4)
| File | Functions | Table | Complexity |
|------|-----------|-------|------------|
| reports-export.service.ts | generatePresencaReport, generateFinanceiroReport | attendance, invoices (aggregate) | MÉDIO |
| retention.service.ts | getRetentionData | attendance, students, invoices (aggregate) | MÉDIO |
| painel-dia.service.ts | getDailyBriefing | attendance, invoices, students, classes | MÉDIO |
| observability.service.ts | getSystemStatus | telemetry_events, error_logs | SIMPLES |

### Tier E — Specialized Profiles (2)
| File | Functions | Table | Complexity |
|------|-----------|-------|------------|
| kids.service.ts | getKidsDashboard | students, xp_ledger, attendance, achievements | MÉDIO |
| network.service.ts | getNetworkDashboard, getFinancials, transferStudent | franchise_networks, franchise_academies, academies | MÉDIO |

### Tier F — IoT & Hardware (4)
| File | Functions | Table | Complexity |
|------|-----------|-------|------------|
| beacon.service.ts | configureBeacon, configureGeofence | academy_settings JSONB | SIMPLES |
| iot.service.ts | getDevices, getDeviceStatus | academy_settings JSONB | SIMPLES |
| proximity-checkin.service.ts | detectProximity, autoCheckin | attendance, academy_settings | MÉDIO |
| qr-checkin.service.ts | generateQRCode, validateQRCode | attendance, classes | MÉDIO |

### Tier G — AI & Advanced (6)
| File | Functions | Table | Complexity |
|------|-----------|-------|------------|
| ai-coach.service.ts | getTrainingSuggestion, analyzePerformance | attendance, students (AI fallback) | COMPLEXO |
| ai-reports.service.ts | generateMonthlyNarrative, generateStudentReport | attendance, invoices (AI fallback) | COMPLEXO |
| competition-predictor.service.ts | predictPerformance, getMatchup | attendance, students (AI fallback) | COMPLEXO |
| personal-ai.service.ts | getPersonalContext, chat | students, attendance (AI fallback) | COMPLEXO |
| posture-analysis.service.ts | analyzePosture, captureAndAnalyze | N/A (vision API) | COMPLEXO |
| voice-assistant.service.ts | processCommand, startListening | N/A (speech API) | COMPLEXO |

### Tier H — Platform & Developer (4)
| File | Functions | Table | Complexity |
|------|-----------|-------|------------|
| api-keys.service.ts | generateApiKey, listApiKeys, revokeApiKey | academy_settings JSONB | SIMPLES |
| app-store.service.ts | listApps, getApp, submitApp | academy_settings JSONB | SIMPLES |
| developer.service.ts | getDeveloperProfile, getSubmittedApps | profiles, academy_settings | SIMPLES |
| plugins.service.ts | listPlugins, installPlugin | academy_settings JSONB | SIMPLES |

### Tier I — Privacy & Compliance (1)
| File | Functions | Table | Complexity |
|------|-----------|-------|------------|
| privacy.service.ts | getConsents, updateConsent, requestExport, requestDeletion | consent_records, data_export_requests, data_deletion_requests | MÉDIO |

### Tier J — Wearable & Health (1)
| File | Functions | Table | Complexity |
|------|-----------|-------|------------|
| wearable.service.ts | syncHealthData, getHealthHistory, getRealtimeMetrics | academy_settings JSONB (health) | MÉDIO |

### Tier K — Sports (2)
| File | Functions | Table | Complexity |
|------|-----------|-------|------------|
| championship-live.service.ts | getLiveMatches, getResults, getMedalTable | tournaments, tournament_matches | MÉDIO |
| federation-ranking.service.ts | getAthleteRanking, getAcademyRanking | tournaments, students, attendance | MÉDIO |
