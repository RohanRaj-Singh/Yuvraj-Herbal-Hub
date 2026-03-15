import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import style from '../../admin.module.css';

const RevenueChart = ({ monthlyData }) => (
  <div className={style.chartCard}>
    <h3>Revenue & Profit Trends</h3>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={monthlyData}>
        <defs>
          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenue)" />
        <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="url(#colorProfit)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default RevenueChart;