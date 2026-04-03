import axiosInstance from "@/api";
import { useCallback, useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";

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

const stableStringify = (val: any): string => {
  if (val === undefined) return "";
  if (val === null) return "null";
  if (typeof val !== "object") return String(val);
  if (Array.isArray(val)) return `[${val.map(stableStringify).join(",")}]`;

  const keys = Object.keys(val).sort();
  return `{${keys.map((k) => `${k}:${stableStringify(val[k])}`).join(",")}}`;
};

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
  const [isRefetching, setIsRefetching] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const paramsRef = useRef<P | undefined>(params);
  const bodyRef = useRef<B | undefined>(body);
  const headersRef = useRef<Record<string, string> | undefined>(headers);
  const transformRef = useRef<typeof transformResponse | undefined>(transformResponse);

  const hasFetchedOnceRef = useRef(false);

  // ✅ de-dupe: store in-flight key + promise + controller
  const inFlightKeyRef = useRef<string | null>(null);
  const inFlightPromiseRef = useRef<Promise<any> | null>(null);
  const inFlightControllerRef = useRef<AbortController | null>(null);

  useEffect(() => { paramsRef.current = params; }, [params]);
  useEffect(() => { bodyRef.current = body; }, [body]);
  useEffect(() => { headersRef.current = headers; }, [headers]);
  useEffect(() => { transformRef.current = transformResponse; }, [transformResponse]);

  const performRequest = useCallback(
    async (override?: { url?: string; params?: P; body?: B }) => {
      const requestUrl = override?.url ?? url;
      const reqParams = override?.params ?? paramsRef.current;
      const reqBody = override?.body ?? bodyRef.current;

      const requestKey =
        `${method}|${requestUrl}|${stableStringify(reqParams)}|${stableStringify(reqBody)}`;

      // ✅ Dedupe ONLY if same request is running and NOT aborted
      if (
        inFlightPromiseRef.current &&
        inFlightKeyRef.current === requestKey &&
        inFlightControllerRef.current &&
        !inFlightControllerRef.current.signal.aborted
      ) {
        if (hasFetchedOnceRef.current) setIsRefetching(true);
        return inFlightPromiseRef.current;
      }

      // ✅ Different request: cancel previous & CLEAR dedupe cache
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = null;

      inFlightKeyRef.current = null;
      inFlightPromiseRef.current = null;
      inFlightControllerRef.current = null;

      const controller = new AbortController();
      abortRef.current = controller;

      setError(null);

      if (hasFetchedOnceRef.current) setIsRefetching(true);
      else setIsLoading(true);

      const requestPromise = (async () => {
        try {
          const axiosConfig: any = {
            signal: controller.signal,
            params: reqParams,
            headers: headersRef.current,
          };

          let res;
          if (method === "get" || method === "delete") {
            res = await (axiosInstance as any)[method](requestUrl, axiosConfig);
          } else {
            res = await (axiosInstance as any)[method](requestUrl, reqBody, axiosConfig);
          }

          const payload = transformRef.current ? transformRef.current(res.data) : res.data;

          if (["post", "patch", "delete"].includes(method.toLowerCase().trim())) {
            if (requestUrl === "/admin/signin/") {
              Cookies.set("access_token", res.data?.data?.access_token, {
                expires: 7,
                secure: import.meta.env.PROD,
                sameSite: "strict",
              });
            }
          }

          setData(payload);
          hasFetchedOnceRef.current = true;
          setTimeout(() => {
            setIsLoading(false);
            setIsRefetching(false);
          }, 100);
          return payload;
        } catch (err: any) {
          const canceled =
            err?.code === "ERR_CANCELED" ||
            err?.name === "CanceledError" ||
            err?.message === "canceled";
            

          if (canceled) return Promise.reject({ canceled: true });

          setError(err);
          hasFetchedOnceRef.current = true;
          setTimeout(() => {
            setIsLoading(false);
            setIsRefetching(false);
          }, 100);
          return Promise.reject(err);

        } finally {
          // ✅ clear in-flight only if this request is still the current one
          if (inFlightKeyRef.current === requestKey) {
            inFlightKeyRef.current = null;
            inFlightPromiseRef.current = null;
            inFlightControllerRef.current = null;
          }
          abortRef.current = null;
        }
      })();

      // ✅ store for de-dupe
      inFlightKeyRef.current = requestKey;
      inFlightPromiseRef.current = requestPromise;
      inFlightControllerRef.current = controller;

      return requestPromise;
    },
    [url, method]
  );

  useEffect(() => {
    if (auto) void performRequest();
    return () => {
      // ✅ cleanup abort + clear dedupe cache (fixes StrictMode double-mount issue)
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = null;

      inFlightKeyRef.current = null;
      inFlightPromiseRef.current = null;
      inFlightControllerRef.current = null;
    };
  }, [auto, url, method, performRequest]);

  const refetch = useCallback(
    (override?: { url?: string; params?: P; body?: B }) => performRequest(override),
    [performRequest]
  );

  const cancel = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = null;

    // ✅ also clear dedupe cache on cancel
    inFlightKeyRef.current = null;
    inFlightPromiseRef.current = null;
    inFlightControllerRef.current = null;
  }, []);

  const isFetching = isLoading || isRefetching;

  return { data, error, isLoading, isRefetching, isFetching, refetch, cancel } as const;
}
