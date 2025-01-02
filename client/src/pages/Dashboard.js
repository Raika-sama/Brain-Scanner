import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Box,
  useTheme
} from '@mui/material';
import {
  Timeline as Activity,
  MenuBook as BookOpen,
  Group as Users,
  Schedule as Clock,
  CheckCircle as CheckCircle2,
  AddCircle as PlusCircle,
  School as GraduationCap,
  TableChart as FileSpreadsheet
} from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Lun', completati: 4, inCorso: 2 },
  { name: 'Mar', completati: 3, inCorso: 1 },
  { name: 'Mer', completati: 5, inCorso: 3 },
  { name: 'Gio', completati: 7, inCorso: 4 },
  { name: 'Ven', completati: 6, inCorso: 2 },
];

const Dashboard = () => {
  const theme = useTheme();
  
  const [dashboardData] = useState({
    stats: {
      testDisponibili: 8,
      testCompletati: 45,
      testInCorso: 3,
      mediaRisultati: 78
    },
    recentActivities: [
      {
        title: "Test Cognitivo completato",
        class: "Classe 3A - 24 studenti",
        time: "2 ore fa",
        status: "completed"
      },
      {
        title: "Test Logico iniziato",
        class: "Classe 4B - in corso",
        time: "30 minuti fa",
        status: "in_progress"
      }
    ]
  });

  const statsCards = [
    {
      title: "Test Disponibili",
      value: dashboardData.stats.testDisponibili,
      icon: BookOpen,
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light
    },
    {
      title: "Test Completati",
      value: dashboardData.stats.testCompletati,
      icon: CheckCircle2,
      color: theme.palette.success.main,
      bgColor: theme.palette.success.light
    },
    {
      title: "Test in Corso",
      value: dashboardData.stats.testInCorso,
      icon: Clock,
      color: theme.palette.warning.main,
      bgColor: theme.palette.warning.light
    },
    {
      title: "Media Risultati",
      value: `${dashboardData.stats.mediaRisultati}%`,
      icon: Activity,
      color: theme.palette.secondary.main,
      bgColor: theme.palette.secondary.light
    }
  ];

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} md={6} lg={3} key={index}>
            <Card sx={{ 
              '&:hover': { 
                boxShadow: 6,
                transition: 'box-shadow 0.3s ease-in-out'
              }
            }}>
              <CardHeader
                sx={{ pb: 1 }}
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {card.title}
                    </Typography>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: card.bgColor }}>
                      <card.icon sx={{ fontSize: 20, color: card.color }} />
                    </Box>
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="h4" component="div">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Activity Chart */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Attività Settimanale" />
        <CardContent>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCompletati" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInCorso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="completati"
                  stroke={theme.palette.primary.main}
                  fillOpacity={1}
                  fill="url(#colorCompletati)"
                />
                <Area
                  type="monotone"
                  dataKey="inCorso"
                  stroke={theme.palette.secondary.main}
                  fillOpacity={1}
                  fill="url(#colorInCorso)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader title="Attività Recenti" />
        <CardContent>
          <Grid container spacing={2}>
            {dashboardData.recentActivities.map((activity, index) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'grey.50',
                  '&:hover': { bgcolor: 'grey.100' }
                }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: '50%',
                    bgcolor: activity.status === 'completed' 
                      ? 'success.light'
                      : 'warning.light'
                  }}>
                    {activity.status === 'completed' ? (
                      <CheckCircle2 sx={{ color: 'success.main' }} />
                    ) : (
                      <Clock sx={{ color: 'warning.main' }} />
                    )}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1">
                      {activity.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.class}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;