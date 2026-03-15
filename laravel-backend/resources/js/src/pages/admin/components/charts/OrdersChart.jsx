import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import style from '../../admin.module.css';

const OrdersChart = ({ monthlyData }) => (
  <div className={style.chartCard}>
    <h3>Orders Over Time</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="orders" fill="#3b82f6" barSize={40} radius={[8, 8, 0, 0]} name="Orders" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default OrdersChart;