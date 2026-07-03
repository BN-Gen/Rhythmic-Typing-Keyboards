/**
 * Phase 5 — Future backend schema (design only, no server).
 * Local data can migrate to this structure when accounts ship.
 */
export const BACKEND_SCHEMA = {
  version: 1,
  roles: ['parent', 'teacher', 'school_admin', 'therapist'],
  entities: {
    account: { id: 'uuid', email: 'string', role: 'string', schoolId: 'uuid?' },
    student: { id: 'uuid', displayName: 'string', pictureCode: 'string?', classIds: 'uuid[]' },
    class: { id: 'uuid', name: 'string', teacherId: 'uuid', studentIds: 'uuid[]' },
    session: {
      id: 'uuid', studentId: 'uuid', keyboardId: 'string', activity: 'string',
      startedAt: 'iso', endedAt: 'iso', events: 'json[]'
    },
    progressReport: { studentId: 'uuid', period: 'string', metrics: 'json' }
  },
  privacy: {
    rawEventsOnDevice: true,
    cloudStoresAggregatesOnly: false,
    piiInCloud: false,
    coppaReviewRequired: true
  }
};

export function sessionToCloudPayload(localSession) {
  return {
    schemaVersion: BACKEND_SCHEMA.version,
    session: {
      keyboardId: localSession.meta?.keyboard,
      activity: localSession.meta?.activity,
      startedAt: new Date(localSession.start).toISOString(),
      eventCount: localSession.eventCount || 0
    }
  };
}
