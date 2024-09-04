import { useMemo, useState } from "react";
import { DataResponse, RequestParams } from "../types";
import { _get, useQuery as useQ } from "../query";



type Parameter = Record<string, any> & RequestParams;

export interface useTableQueryOptions {
    query: string;
    queryId: string | string[];
    parameters?: Parameter;
    enabled?: boolean;
    /** Default is 'data' => response['data'] */
    dataKey?: string;
}

export function useQuery<T = any>({ query, dataKey = "data" as const, enabled, queryId, parameters }: useTableQueryOptions) {
    const LIMIT = 10;
    const [page, setPage] = useState(0);
    const parsedParameters = useMemo(() => ({ ...(parameters || {}), ...({limit: LIMIT, from: page, skip: page}) }), [page, parameters]);

    const parsedId = useMemo(() => {
        const dynamicId = parsedParameters ? JSON.stringify(parsedParameters) : '';
        if (Array.isArray(queryId)) return queryId.map(item => item.concat(dynamicId));
        return queryId + dynamicId
    }, [parsedParameters, queryId])

    const { data: responseData, isLoading, isRefetching, error, refetch,  } = useQ<DataResponse<T>>(parsedId, () =>
        _get(query, parsedParameters),
        {
            enabled,
            keepPreviousData: true
        }
    );

    const { total } = responseData || {};

    const loadMore = () => {
        setPage(old => old + LIMIT)
    }

    return {
        data: (responseData as any)?.[dataKey] || [] as T[],
        isLoading,
        isRefetching,
        error: error as any,
        total: total || 0,
        refetch,
        loadMore,
    }
}
