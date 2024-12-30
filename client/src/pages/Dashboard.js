import React, { useState } from 'react';

import { 
  Activity, 
  BookOpen, 
  Users, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  GraduationCap, 
  FileSpreadsheet 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Lun', completati: 4, inCorso: 2 },
  { name: 'Mar', completati: 3, inCorso: 1 },
  { name: 'Mer', completati: 5, inCorso: 3 },
  { name: 'Gio', completati: 7, inCorso: 4 },
  { name: 'Ven', completati: 6, inCorso: 2 },
];

const Dashboard = () => {
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
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Test Completati", 
      value: dashboardData.stats.testCompletati,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Test in Corso",
      value: dashboardData.stats.testInCorso,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Media Risultati",
      value: `${dashboardData.stats.mediaRisultati}%`,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} p-2 rounded-lg`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Attività Settimanale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCompletati" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInCorso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="completati"
                  stroke="#4F46E5"
                  fillOpacity={1}
                  fill="url(#colorCompletati)"
                />
                <Area
                  type="monotone"
                  dataKey="inCorso"
                  stroke="#EC4899"
                  fillOpacity={1}
                  fill="url(#colorInCorso)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Attività Recenti</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dashboardData.recentActivities.map((activity, index) => (
            <div key={index} 
              className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className={`p-2 rounded-full ${
                activity.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                {activity.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{activity.title}</h3>
                <p className="text-sm text-gray-600">{activity.class}</p>
                <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;