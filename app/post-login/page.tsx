const routingLogic = (row) => {
    if (row.status === 'blocked') {
        return '/blocked';
    } else if (row.status === 'pending' && !row.isOwner) {
        return '/pending';
    } else {
        return '/loads';
    }
};

router.replace(routingLogic(row));
