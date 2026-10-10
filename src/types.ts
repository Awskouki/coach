/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SubscriptionType } from './utils/subscriptions';

export interface ProgressPoint {
  date: string;
  poid: number;
  taille: number;
  bmi?: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  poid: number;
  taille: number;
  progress: ProgressPoint[];
  regime: string;
  subscriptionType: SubscriptionType | '3_months' | '6_months';
  subscriptionStartDate?: string;
  paymentStatus: 'paid' | 'pending';
  paymentMethod: 'bank_transfer' | 'cash';
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  clientId: string;
  clientName: string;
  dateTime: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface PaymentRecord {
  id: string;
  clientId: string;
  amount: number;
  date: string;
  type: SubscriptionType;
  method: 'bank_transfer' | 'cash';
}

export type { SubscriptionType };
