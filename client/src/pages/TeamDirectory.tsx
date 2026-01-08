import { Layout } from "@/components/layout/Layout";
import { teamMembers } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, ChevronRight, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  managerId: string | null;
  email: string;
}

const OrgNode = ({ member, level = 0 }: { member: TeamMember; level?: number }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const reports = teamMembers.filter(m => m.managerId === member.id);
  const hasReports = reports.length > 0;

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <Card className="w-64 border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-primary/10">
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.role}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-medium">
                {member.department}
              </Badge>
              {hasReports && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 hover:bg-secondary rounded-md transition-colors"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
            </div>
          </CardContent>
        </Card>
        {hasReports && isExpanded && (
          <div className="h-8 w-px bg-border mx-auto" />
        )}
      </motion.div>

      <AnimatePresence>
        {hasReports && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col items-center"
          >
            <div className="relative flex justify-center pt-0">
              {reports.length > 1 && (
                <div className="absolute top-0 left-[25%] right-[25%] h-px bg-border" />
              )}
              <div className="flex gap-8 px-4">
                {reports.map((report) => (
                  <div key={report.id} className="relative pt-8">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-8 w-px bg-border" />
                    <OrgNode member={report} level={level + 1} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function TeamDirectory() {
  const [search, setSearch] = useState("");
  const topLevel = teamMembers.filter(m => m.managerId === null);
  
  const filteredMembers = teamMembers.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    m.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Team Directory</h1>
            <p className="text-muted-foreground mt-2">Connect with colleagues across the organization.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, role, or dept..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-secondary/30"
            />
          </div>
        </div>

        <div className="bg-background rounded-3xl border border-border overflow-hidden p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2 h-6 bg-primary rounded-full" />
            <h2 className="text-xl font-bold font-display">Organizational Chart</h2>
          </div>
          
          <div className="overflow-x-auto pb-10">
            <div className="min-w-max p-4 flex justify-center">
              {topLevel.map(ceo => (
                <OrgNode key={ceo.id} member={ceo} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-primary rounded-full" />
            <h2 className="text-xl font-bold font-display">All Members</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/10 shadow-sm">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-lg">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg leading-none group-hover:text-primary transition-colors">{member.name}</h3>
                          <p className="text-sm font-medium text-muted-foreground">{member.role}</p>
                          <Badge variant="secondary" className="mt-2 text-[10px] uppercase tracking-wider font-bold">
                            {member.department}
                          </Badge>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-full transition-colors text-muted-foreground">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span>Reporting to: {teamMembers.find(m => m.id === member.managerId)?.name || 'Board'}</span>
                      <span className="font-medium underline cursor-pointer hover:text-primary">View Profile</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}