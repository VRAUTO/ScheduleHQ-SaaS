import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const TestSupabase = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [authStatus, setAuthStatus] = useState('Not checked');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      addLog('Testing Supabase connection...');

      // Test basic connection with a simple query
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });

      if (error) {
        addLog(`Connection error: ${error.message}`);
        setConnectionStatus(`❌ Error: ${error.message}`);
      } else {
        addLog('✅ Successfully connected to Supabase');
        setConnectionStatus('✅ Connected to Supabase');
      }

      // Test auth session
      const { data: session } = await supabase.auth.getSession();
      setAuthStatus(session.session ? '✅ User logged in' : '❌ No active session');
      addLog(`Auth session: ${session.session ? 'Active' : 'None'}`);

    } catch (err) {
      addLog(`Test error: ${err.message}`);
      setConnectionStatus(`❌ Error: ${err.message}`);
    }
  };

  const testSignUp = async () => {
    try {
      addLog('Testing signup with test@example.com...');
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123'
      });

      if (error) {
        addLog(`Signup error: ${error.message}`);
        alert(`Signup failed: ${error.message}`);
      } else {
        addLog(`Signup success: ${JSON.stringify(data, null, 2)}`);
        alert('Signup test successful! Check logs for details.');
      }
    } catch (err) {
      addLog(`Signup test error: ${err.message}`);
      alert(`Signup test error: ${err.message}`);
    }
  };

  const testSignIn = async () => {
    try {
      addLog('Testing signin with test@example.com...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      });

      if (error) {
        addLog(`Signin error: ${error.message}`);
        alert(`Signin failed: ${error.message}`);
      } else {
        addLog(`Signin success: ${JSON.stringify(data, null, 2)}`);
        alert('Signin test successful! Check logs for details.');
      }
    } catch (err) {
      addLog(`Signin test error: ${err.message}`);
      alert(`Signin test error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px' }}>
      <h2>Supabase Connection & Auth Test</h2>

      <div style={{ marginBottom: '10px' }}>
        <strong>Connection Status:</strong> {connectionStatus}
      </div>
      <div style={{ marginBottom: '20px' }}>
        <strong>Auth Status:</strong> {authStatus}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={testSignUp}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test Signup
        </button>

        <button
          onClick={testSignIn}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test Signin
        </button>

        <button
          onClick={testConnection}
          style={{
            padding: '10px 20px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retest Connection
        </button>
      </div>

      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '15px',
        borderRadius: '4px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <h3>Debug Logs:</h3>
        {logs.map((log, index) => (
          <div key={index} style={{
            fontSize: '12px',
            marginBottom: '5px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap'
          }}>
            {log}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>Open browser console (F12) to see additional logs</p>
        <p><a href="/">← Back to SignUp Page</a></p>
      </div>
    </div>
  );
};

export default TestSupabase;
