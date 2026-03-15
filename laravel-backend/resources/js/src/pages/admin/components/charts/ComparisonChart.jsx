import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import style from '../../admin.module.css';

const ComparisonChart = ({ monthlyData }) => (
  <div className={style.chartCard}>
    <h3>Monthly Comparison</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Orders" dot={{ r: 5 }} />
        <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" dot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default ComparisonChart;