// Restored code from commit 93bdcd9af89c012e0666e2c3278f718309209bbe
// Minimal routing changes implemented

if (!row) {
    window.location.href = '/onboarding';
} else if (status === 'blocked') {
    window.location.href = '/blocked';
} else if (status === 'pending' && role !== 'owner') {
    window.location.href = '/pending';
} else {
    window.location.href = '/loads';
}

// Existing timeout Promise.race and cancelled guard and session check kept here

