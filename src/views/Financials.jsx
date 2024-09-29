import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    TextField,
    Button,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const initialData = [
    { month: 'Jan', earnings: 4000, expenses: 2000 },
    { month: 'Feb', earnings: 3000, expenses: 1500 },
    { month: 'Mar', earnings: 5000, expenses: 2500 },
    { month: 'Apr', earnings: 4000, expenses: 2000 },
    { month: 'May', earnings: 6000, expenses: 3000 },
    { month: 'Jun', earnings: 7000, expenses: 3500 },
    { month: 'Jul', earnings: 8000, expenses: 4000 },
    { month: 'Aug', earnings: 5000, expenses: 2500 },
    { month: 'Sep', earnings: 4000, expenses: 2000 },
    { month: 'Oct', earnings: 6000, expenses: 3000 },
    { month: 'Nov', earnings: 7000, expenses: 3500 },
    { month: 'Dec', earnings: 8000, expenses: 4000 },
];

const expenseCategories = [
    { name: 'Salaries', value: 40000 },
    { name: 'Rent', value: 15000 },
    { name: 'Utilities', value: 5000 },
    { name: 'Marketing', value: 10000 },
    { name: 'Miscellaneous', value: 5000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const Financials = () => {
    const [data, setData] = useState(initialData);

    const handleDataChange = (index, field, value) => {
        const newData = [...data];
        newData[index][field] = value;
        setData(newData);
    };

    const totalEarnings = data.reduce((sum, item) => sum + item.earnings, 0);
    const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
    const totalProfit = totalEarnings - totalExpenses;
    const averageEarnings = (totalEarnings / data.length).toFixed(2);
    const averageExpenses = (totalExpenses / data.length).toFixed(2);
    const netProfitMargin = ((totalProfit / totalEarnings) * 100).toFixed(2);

    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Financials Overview
            </Typography>

            {/* Financial Summary */}
            <Box marginBottom={4}>
                <Typography variant="h6">Financial Summary</Typography>
                <Typography variant="body1">
                    <strong>Total Earnings:</strong> ${totalEarnings.toLocaleString()}
                </Typography>
                <Typography variant="body1">
                    <strong>Total Expenses:</strong> ${totalExpenses.toLocaleString()}
                </Typography>
                <Typography variant="body1">
                    <strong>Total Profit:</strong> ${totalProfit.toLocaleString()}
                </Typography>
                <Typography variant="body1">
                    <strong>Average Monthly Earnings:</strong> $
                    {averageEarnings.toLocaleString()}
                </Typography>
                <Typography variant="body1">
                    <strong>Average Monthly Expenses:</strong> $
                    {averageExpenses.toLocaleString()}
                </Typography>
                <Typography variant="body1">
                    <strong>Net Profit Margin:</strong> {netProfitMargin}%
                </Typography>
            </Box>

            {/* Earnings and Expenses Line Chart */}
            <Typography variant="h6" gutterBottom>
                Earnings vs. Expenses
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="earnings"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name="Earnings"
                    />
                    <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="#82ca9d"
                        name="Expenses"
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* Profit Bar Chart */}
            <Typography variant="h6" gutterBottom style={{ marginTop: 32 }}>
                Monthly Profit
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="earnings" fill="#8884d8" name="Earnings" />
                    <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
                    <Bar
                        dataKey={(entry) => entry.earnings - entry.expenses}
                        fill="#ffc658"
                        name="Profit"
                    />
                </BarChart>
            </ResponsiveContainer>

            {/* Expense Breakdown Pie Chart */}
            <Typography variant="h6" gutterBottom style={{ marginTop: 32 }}>
                Expense Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={expenseCategories}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                    >
                        {expenseCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>

            {/* Data Adjustments */}
            <Box marginTop={4}>
                <Typography variant="h6" gutterBottom>
                    Adjust Earnings and Expenses
                </Typography>
                <Grid container spacing={2}>
                    {data.map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} key={item.month}>
                            <TextField
                                label={`${item.month} Earnings`}
                                type="number"
                                value={item.earnings}
                                onChange={(e) =>
                                    handleDataChange(index, 'earnings', Number(e.target.value))
                                }
                                fullWidth
                                variant="outlined"
                                margin="normal"
                            />
                            <TextField
                                label={`${item.month} Expenses`}
                                type="number"
                                value={item.expenses}
                                onChange={(e) =>
                                    handleDataChange(index, 'expenses', Number(e.target.value))
                                }
                                fullWidth
                                variant="outlined"
                                margin="normal"
                            />
                        </Grid>
                    ))}
                </Grid>
                <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: 16 }}
                    onClick={() => alert('Financial data saved!')}
                >
                    Save Changes
                </Button>
            </Box>
        </Box>
    );
};

export default Financials;