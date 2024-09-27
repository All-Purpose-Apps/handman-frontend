// DashboardPage.jsx

import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import {
    People as PeopleIcon,
    Receipt as ReceiptIcon,
    Description as DescriptionIcon,
} from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import moment from 'moment';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';

const DashboardPage = () => {
    // Sample data
    const totalClients = 150;
    const totalInvoices = 75;
    const totalProposals = 50;

    const recentClients = [
        { name: 'Client A', date: '2023-11-01' },
        { name: 'Client B', date: '2023-10-28' },
        { name: 'Client C', date: '2023-10-25' },
    ];

    const recentInvoices = [
        { id: 'INV-001', amount: 500, date: '2023-11-02' },
        { id: 'INV-002', amount: 750, date: '2023-10-30' },
        { id: 'INV-003', amount: 250, date: '2023-10-27' },
    ];

    const [timePeriod, setTimePeriod] = React.useState('Last 7 Days');
    const [chartData, setChartData] = React.useState({
        x: [
            '2023-10-29',
            '2023-10-30',
            '2023-10-31',
            '2023-11-01',
            '2023-11-02',
            '2023-11-03',
            '2023-11-04',
        ],
        y: [500, 700, 800, 600, 900, 750, 650],
    });

    const [selectedDate, setSelectedDate] = React.useState(moment());

    const handleTimePeriodChange = (event) => {
        const period = event.target.value;
        setTimePeriod(period);

        // Update chart data based on selected time period
        // For demonstration, we'll adjust the data randomly
        let newChartData = {};
        if (period === 'Last 7 Days') {
            newChartData = {
                x: [
                    '2023-10-29',
                    '2023-10-30',
                    '2023-10-31',
                    '2023-11-01',
                    '2023-11-02',
                    '2023-11-03',
                    '2023-11-04',
                ],
                y: Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000)),
            };
        } else if (period === 'Last 30 Days') {
            newChartData = {
                x: Array.from({ length: 30 }, (_, i) =>
                    moment().subtract(i, 'days').format('YYYY-MM-DD')
                ).reverse(),
                y: Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000)),
            };
        } else if (period === 'Last 3 Months') {
            newChartData = {
                x: [
                    moment().subtract(2, 'months').format('MMMM'),
                    moment().subtract(1, 'months').format('MMMM'),
                    moment().format('MMMM'),
                ],
                y: Array.from({ length: 3 }, () => Math.floor(Math.random() * 10000)),
            };
        } else if (period === 'Last Year') {
            newChartData = {
                x: moment.monthsShort(),
                y: Array.from({ length: 12 }, () => Math.floor(Math.random() * 20000)),
            };
        }
        setChartData(newChartData);
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Grid container spacing={3}>
                {/* Info Cards */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                            <Box>
                                <Typography variant="h5">{totalClients}</Typography>
                                <Typography color="textSecondary">Total Clients</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <ReceiptIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                            <Box>
                                <Typography variant="h5">{totalInvoices}</Typography>
                                <Typography color="textSecondary">Total Invoices</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <DescriptionIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                            <Box>
                                <Typography variant="h5">{totalProposals}</Typography>
                                <Typography color="textSecondary">Total Proposals</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Clients */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader
                            title="Recent Clients"
                            sx={{ backgroundColor: 'primary.main', color: 'white' }}
                        />
                        <CardContent>
                            <List>
                                {recentClients.map((client, index) => (
                                    <div key={index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={client.name}
                                                secondary={moment(client.date).format('LL')}
                                            />
                                        </ListItem>
                                        {index < recentClients.length - 1 && <Divider />}
                                    </div>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Invoices */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader
                            title="Recent Invoices"
                            sx={{ backgroundColor: 'primary.main', color: 'white' }}
                        />
                        <CardContent>
                            <List>
                                {recentInvoices.map((invoice, index) => (
                                    <div key={index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={`Invoice ${invoice.id}`}
                                                secondary={`Amount: $${invoice.amount} - ${moment(
                                                    invoice.date
                                                ).format('LL')}`}
                                            />
                                        </ListItem>
                                        {index < recentInvoices.length - 1 && <Divider />}
                                    </div>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Earnings Chart */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardHeader
                            title="Earnings"
                            sx={{ backgroundColor: 'primary.main', color: 'white' }}
                            action={
                                <FormControl variant="outlined" size="small" sx={{ mr: 2, mt: 1 }}>
                                    <InputLabel id="time-period-label">Time Period</InputLabel>
                                    <Select
                                        labelId="time-period-label"
                                        value={timePeriod}
                                        onChange={handleTimePeriodChange}
                                        label="Time Period"
                                    >
                                        <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
                                        <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
                                        <MenuItem value="Last 3 Months">Last 3 Months</MenuItem>
                                        <MenuItem value="Last Year">Last Year</MenuItem>
                                    </Select>
                                </FormControl>
                            }
                        />
                        <CardContent>
                            <Box sx={{ height: 300 }}>
                                <LineChart
                                    xAxis={[{ data: chartData.x, label: 'Date' }]}
                                    series={[
                                        {
                                            data: chartData.y,
                                            label: 'Earnings',
                                            color: '#3f51b5',
                                        },
                                    ]}
                                    height={300}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Calendar */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardHeader
                            title="Calendar"
                            sx={{ backgroundColor: 'primary.main', color: 'white' }}
                        />
                        <CardContent>
                            <LocalizationProvider dateAdapter={AdapterMoment}>
                                <StaticDatePicker
                                    displayStaticWrapperAs="desktop"
                                    value={selectedDate}
                                    onChange={(date) => setSelectedDate(date)}
                                    renderInput={() => null}
                                />
                            </LocalizationProvider>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;