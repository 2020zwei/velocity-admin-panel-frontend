import axiosInstance from "@/api";
import { useCallback, useEffect, useRef, useState } from "react";

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export interface UseApiOptions<TParams = any, TBody = any> {
  url: string;
  method?: HttpMethod;
  params?: TParams;
  body?: TBody;
  auto?: boolean;
  headers?: Record<string, string>;
  transformResponse?: (data: any) => any;
}

export function useApi<T = any, P = any, B = any>(opts: UseApiOptions<P, B>) {
  const {
    url,
    method = "get",
    params,
    body,
    auto = true,
    headers,
    transformResponse,
  } = opts;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Refs to keep the latest values without re-creating callbacks
  const abortRef = useRef<AbortController | null>(null);
  const paramsRef = useRef<P | undefined>(params);
  const bodyRef = useRef<B | undefined>(body);
  const headersRef = useRef<Record<string, string> | undefined>(headers);
  const transformRef = useRef<typeof transformResponse | undefined>(transformResponse);

  // keep refs up-to-date when inputs change (does NOT trigger new callbacks)
  useEffect(() => { paramsRef.current = params; }, [params]);
  useEffect(() => { bodyRef.current = body; }, [body]);
  useEffect(() => { headersRef.current = headers; }, [headers]);
  useEffect(() => { transformRef.current = transformResponse; }, [transformResponse]);

  // performRequest is stable (no changing deps) — uses refs for dynamic values
  const performRequest = useCallback(
    async (override?: { params?: P; body?: B }) => {
      // cancel previous
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const axiosConfig: any = {
          signal: controller.signal,
          params: override?.params ?? paramsRef.current,
          headers: headersRef.current,
        };

        let res;
        if (method === "get" || method === "delete") {
          res = await (axiosInstance as any)[method](url, axiosConfig);
        } else {
          res = await (axiosInstance as any)[method](
            url,
            override?.body ?? bodyRef.current,
            axiosConfig
          );
        }

        const payload = transformRef.current ? transformRef.current(res.data) : res.data;
        setData(payload);
        return payload;
      } catch (err: any) {
        // ignore cancellation
        if (err?.name === "CanceledError" || err?.message === "canceled") {
          return Promise.reject({ canceled: true });
        }
        setError(err);
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [url, method]
  );
  useEffect(() => {
    if (auto) {
      void performRequest();
    }
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [auto, url, method, performRequest]); // performRequest stable due to callbacks above

  const refetch = useCallback(
    (override?: { params?: P; body?: B }) => performRequest(override),
    [performRequest]
  );
  const cancel = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  return { data, error, isLoading, refetch, cancel } as const;
}
