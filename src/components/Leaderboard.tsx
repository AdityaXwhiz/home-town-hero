import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Trophy, 
  Medal, 
  Star, 
  Award,
  TrendingUp,
  Users
} from "lucide-react";

export const Leaderboard = () => {
  // ✅ Updated with Indian names and context
  const topReporters = [
    {
      rank: 1,
      name: "Priya Sharma",
      reports: 47,
      resolved: 43,
      stars: 156,
      badges: ["Gold Reporter", "Samaj Hero"],
      avatar: "PS",
      trend: "+5"
    },
    {
      rank: 2, 
      name: "Rohan Kumar",
      reports: 39,
      resolved: 37,
      stars: 134,
      badges: ["Silver Reporter", "Mohalla Watch"],
      avatar: "RK",
      trend: "+3"
    },
    {
      rank: 3,
      name: "Anjali Singh", 
      reports: 34,
      resolved: 31,
      stars: 118,
      badges: ["Bronze Reporter", "Safety First"],
      avatar: "AS", 
      trend: "+7"
    },
    {
      rank: 4,
      name: "Vikram Patel",
      reports: 29,
      resolved: 28,
      stars: 89,
      badges: ["Active Citizen"],
      avatar: "VP",
      trend: "+2"
    },
    {
      rank: 5,
      name: "Meera Gupta",
      reports: 25,
      resolved: 24,
      stars: 76,
      badges: ["Community Helper"],
      avatar: "MG", 
      trend: "+4"
    }
  ];

  // ✅ Updated with Indian context
  const badges = [
    {
      name: "Pehla Kadam", // First Step
      description: "First to report an issue in your area",
      icon: Trophy,
      color: "bg-yellow-500",
      requirements: "Report 1 issue"
    },
    {
      name: "Samaj Hero", // Community Hero
      description: "Reported 25+ issues that got resolved",
      icon: Award,
      color: "bg-blue-500", 
      requirements: "25 resolved reports"
    },
    {
      name: "Suraksha Champion", // Safety Champion
      description: "Consistently reports safety hazards",
      icon: Medal,
      color: "bg-green-500",
      requirements: "10 safety reports"
    },
    {
      name: "Mohalla Guardian", // Neighborhood Guardian
      description: "Active in improving your local community",
      icon: Users,
      color: "bg-purple-500",
      requirements: "50+ total reports"
    }
  ];

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch(rank) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case 2: return "bg-gradient-to-r from-gray-300 to-gray-500";
      case 3: return "bg-gradient-to-r from-amber-400 to-amber-600";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-8">
      {/* Top 3 Podium */}
      <Card className="bg-gradient-civic text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-4">🏆 Top Community Champions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-end gap-8 mb-8">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="bg-gray-300 w-20 h-16 mb-4 rounded-t-lg flex items-end justify-center pb-2">
                <Medal className="h-8 w-8 text-gray-600" />
              </div>
              <Avatar className="mx-auto mb-2 w-16 h-16 border-4 border-gray-300">
                <AvatarFallback className="text-lg font-bold">
                  {topReporters[1].avatar}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <div className="font-bold">{topReporters[1].name}</div>
                <div className="text-sm opacity-90">{topReporters[1].stars} ⭐</div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <div className="bg-yellow-400 w-24 h-20 mb-4 rounded-t-lg flex items-end justify-center pb-2">
                <Trophy className="h-10 w-10 text-yellow-700" />
              </div>
              <Avatar className="mx-auto mb-2 w-20 h-20 border-4 border-yellow-400">
                <AvatarFallback className="text-xl font-bold">
                  {topReporters[0].avatar}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <div className="font-bold text-lg">{topReporters[0].name}</div>
                <div className="text-sm opacity-90">{topReporters[0].stars} ⭐</div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="bg-amber-500 w-20 h-12 mb-4 rounded-t-lg flex items-end justify-center pb-2">
                <Award className="h-6 w-6 text-amber-700" />
              </div>
              <Avatar className="mx-auto mb-2 w-16 h-16 border-4 border-amber-500">
                <AvatarFallback className="text-lg font-bold">
                  {topReporters[2].avatar}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <div className="font-bold">{topReporters[2].name}</div>
                <div className="text-sm opacity-90">{topReporters[2].stars} ⭐</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Community Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topReporters.map((reporter) => (
                <div
                  key={reporter.rank}
                  className={`flex items-center gap-4 p-4 rounded-lg ${getRankColor(reporter.rank)} ${
                    reporter.rank <= 3 ? 'text-white' : 'bg-muted/50'
                  } hover:shadow-card transition-all duration-300`}
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(reporter.rank)}
                  </div>
                  
                  <Avatar>
                    <AvatarFallback>{reporter.avatar}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="font-semibold">{reporter.name}</div>
                    <div className={`text-sm ${reporter.rank <= 3 ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {reporter.reports} reports • {reporter.resolved} resolved
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-bold">{reporter.stars}</span>
                    </div>
                    <div className={`text-xs ${reporter.rank <= 3 ? 'text-white/70' : 'text-green-600'}`}>
                      {reporter.trend} this week
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Badge System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievement Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {badges.map((badge, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`${badge.color} p-3 rounded-full text-white`}>
                    <badge.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{badge.name}</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {badge.description}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {badge.requirements}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Stats */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary mb-1">12</div>
              <div className="text-sm text-muted-foreground">Reports Submitted</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary mb-1">10</div>
              <div className="text-sm text-muted-foreground">Issues Resolved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning mb-1">34</div>
              <div className="text-sm text-muted-foreground">Stars Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-1">2</div>
              <div className="text-sm text-muted-foreground">Badges Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
