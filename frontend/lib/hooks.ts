/**
 * Luvio Platform — Data Fetching Hooks
 * Parallel data loading utilities using Promise.all.
 * All hooks fire multiple requests simultaneously and resolve together.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './api-client';

// ============================================
// Types
// ============================================

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface Job {
  id: string;
  posterId: string;
  title: string;
  description: string;
  images: string[];
  budget: number;
  currency: string;
  paymentMode: 'escrow' | 'cash' | 'wallet';
  category: string;
  locationName: string | null;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  images: string[];
  price: number | null;
  currency: string;
  category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  type: 'sell' | 'giveaway';
  locationName: string | null;
  status: 'active' | 'sold' | 'removed';
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; perPage: number; total: number; pages: number };
}

// ============================================
// Core: useParallelFetch
// Fires N requests simultaneously and resolves all at once.
// ============================================

export function useParallelFetch<T extends Record<string, unknown>>(
  fetchers: { [K in keyof T]: () => Promise<{ success: boolean; data?: T[K]; error?: string }> },
  deps: unknown[] = []
): { data: Partial<T>; loading: boolean; errors: Partial<Record<keyof T, string>>; refetch: () => void } {
  const [data, setData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const fetchCount = useRef(0);

  const run = useCallback(async () => {
    const current = ++fetchCount.current;
    setLoading(true);
    setErrors({});

    const keys = Object.keys(fetchers) as (keyof T)[];

    // Fire ALL requests in parallel
    const results = await Promise.allSettled(
      keys.map((k) => fetchers[k]())
    );

    if (current !== fetchCount.current) return; // stale request

    const newData: Partial<T> = {};
    const newErrors: Partial<Record<keyof T, string>> = {};

    results.forEach((result, idx) => {
      const key = keys[idx];
      if (result.status === 'fulfilled') {
        if (result.value.success && result.value.data !== undefined) {
          newData[key] = result.value.data as T[keyof T];
        } else {
          newErrors[key] = result.value.error ?? 'Unknown error';
        }
      } else {
        newErrors[key] = result.reason?.message ?? 'Network error';
      }
    });

    setData(newData);
    setErrors(newErrors);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, errors, refetch: run };
}

// ============================================
// useJobs — Parallel jobs feed
// Fetches jobs + optionally category counts in parallel
// ============================================

export function useJobs(params: {
  page?: number;
  category?: string;
  status?: string;
} = {}): FetchState<PaginatedResponse<Job>> {
  const { page = 1, category, status = 'open' } = params;
  const [state, setState] = useState<FetchState<PaginatedResponse<Job>>>({
    data: null,
    loading: true,
    error: null,
    refetch: () => {},
  });

  const fetchJobs = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const qs = new URLSearchParams({
      page: String(page),
      perPage: '20',
      status,
      ...(category ? { category } : {}),
    });

    const res = await api.get<PaginatedResponse<Job>>(`/jobs?${qs}`);
    if (res.success) {
      setState((s) => ({ ...s, data: res.data ?? null, loading: false }));
    } else {
      setState((s) => ({ ...s, error: res.error ?? 'Failed to load jobs', loading: false }));
    }
  }, [page, category, status]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { ...state, refetch: fetchJobs };
}

// ============================================
// useListings — Parallel marketplace listings
// ============================================

export function useListings(params: {
  page?: number;
  category?: string;
  type?: string;
} = {}): FetchState<PaginatedResponse<Listing>> {
  const { page = 1, category, type } = params;
  const [state, setState] = useState<FetchState<PaginatedResponse<Listing>>>({
    data: null,
    loading: true,
    error: null,
    refetch: () => {},
  });

  const fetchListings = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const qs = new URLSearchParams({
      page: String(page),
      perPage: '20',
      ...(category ? { category } : {}),
      ...(type ? { type } : {}),
    });

    const res = await api.get<PaginatedResponse<Listing>>(`/marketplace?${qs}`);
    if (res.success) {
      setState((s) => ({ ...s, data: res.data ?? null, loading: false }));
    } else {
      setState((s) => ({ ...s, error: res.error ?? 'Failed to load listings', loading: false }));
    }
  }, [page, category, type]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { ...state, refetch: fetchListings };
}

// ============================================
// useHomeFeed — Fires BOTH jobs + listings in parallel
// Single hook to power a combined home/dashboard feed
// ============================================

export function useHomeFeed() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{ jobs?: string; listings?: string }>({});

  const fetch = useCallback(async () => {
    setLoading(true);
    setErrors({});

    // Fire both API calls at the exact same time
    const [jobsRes, listingsRes] = await Promise.all([
      api.get<PaginatedResponse<Job>>('/jobs?perPage=6&status=open'),
      api.get<PaginatedResponse<Listing>>('/marketplace?perPage=6'),
    ]);

    const newErrors: { jobs?: string; listings?: string } = {};
    if (jobsRes.success) setJobs(jobsRes.data?.data ?? []);
    else newErrors.jobs = jobsRes.error;

    if (listingsRes.success) setListings(listingsRes.data?.data ?? []);
    else newErrors.listings = listingsRes.error;

    setErrors(newErrors);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { jobs, listings, loading, errors, refetch: fetch };
}

// ============================================
// Image preloader — preloads an array of image URLs in parallel
// Call this after data loads to warm the browser cache before render
// ============================================

export function preloadImages(urls: string[]): void {
  if (typeof window === 'undefined') return;
  urls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}

export function useImagePreloader(urls: string[]): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!urls.length) { setReady(true); return; }

    let loaded = 0;
    const total = urls.length;

    urls.forEach((url) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === total) setReady(true);
      };
      img.src = url;
    });
  }, [urls.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return ready;
}
