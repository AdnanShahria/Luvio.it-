'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { Header, MobileNav } from '@/components/layout';

export default function ChatPage() {
  return (
    <AuthProvider>
      <div className="page-wrapper">
        <Header />
        <main className="main-content" style={{ display: 'flex', height: 'calc(100dvh - var(--header-height))' }}>
          {/* Thread List */}
          <div style={{
            width: '100%',
            maxWidth: '24rem',
            borderRight: '1px solid var(--border-color)',
            overflow: 'auto',
          }}>
            <div style={{ padding: 'var(--space-4)' }}>
              <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-4)' }}>
                Messages
              </h1>
              <input
                type="search"
                className="input"
                placeholder="Search conversations..."
                style={{ marginBottom: 'var(--space-4)' }}
                id="chat-search-input"
              />
            </div>

            {/* Empty State */}
            <div style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)', color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>💬</div>
              <p style={{ fontSize: 'var(--font-size-sm)' }}>No conversations yet</p>
              <p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-2)' }}>
                Start a chat from a job or listing page
              </p>
            </div>
          </div>

          {/* Chat Area */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-tertiary)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>📨</div>
              <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                Select a conversation
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
                Choose a thread to start chatting
              </p>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    </AuthProvider>
  );
}
