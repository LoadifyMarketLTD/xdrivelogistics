// Assuming this part of code exists where we handle the routing based on role/status
if (row) {
  if (row.status === 'active' || row.role === 'owner') {
    router.replace('/loads');
  } else {
    // Existing logic for other roles/statuses
    routeForRoleStatus(row);
  }
} else {
  router.replace('/onboarding'); // no-row handling
}