class SearchStrategies {
    buildParams(params) {
        return {};
    }
}

class UserSearchStrategy extends SearchStrategies {
    buildParams(params) {
        return {
            category_id: params.cateId || null,
            name: params.name || null,
        };
    }
}

class CandidateSearchStrategy extends UserSearchStrategy {
    buildParams(params) {
        const basic = super.buildParams(params);
        return {
            ...basic,
            location: params.location || null,
            min_salary: params.min_salary || null,
            working_time_id: params.working_time || null,
        };
    }
}

export { UserSearchStrategy, CandidateSearchStrategy};