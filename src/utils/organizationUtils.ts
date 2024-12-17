import { ProgramAchievement, ProjectImpact } from '../data/organization/achievements';
import { BoardMember } from '../data/organization/board';
import { FinancialPolicy } from '../data/organization/financial';
import { StrategicGoal } from '../data/organization/strategic';
import { HRPolicy } from '../data/organization/hr';
import { Project } from '../data/organization/projects';
import { KPI } from '../data/organization/monitoring';
import { Department } from '../data/organization/structure';

export const calculateTotalBeneficiaries = (projects: ProjectImpact[]): number => {
  return projects.reduce((total, project) => total + project.beneficiaries, 0);
};

export const filterActiveProjects = (projects: Project[]): Project[] => {
  return projects.filter(project => project.period.end === 'ongoing');
};

export const sortBoardByPosition = (members: BoardMember[]): BoardMember[] => {
  const positionOrder = ['Chairman', 'Vice Chairperson', 'Secretary', 'Treasurer', 'Board Member'];
  return [...members].sort((a, b) => {
    return positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position);
  });
};

export const groupPoliciesByCategory = <T extends { category: string }>(
  policies: T[]
): Record<string, T[]> => {
  return policies.reduce((groups, policy) => {
    const category = policy.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(policy);
    return groups;
  }, {} as Record<string, T[]>);
};

export const calculateProjectMetrics = (projects: Project[]) => {
  return {
    totalBeneficiaries: projects.reduce((sum, p) => sum + p.beneficiaries, 0),
    totalFunding: projects.reduce((sum, p) => sum + p.amount, 0),
    activeProjects: projects.filter(p => p.period.end === 'ongoing').length,
    completedProjects: projects.filter(p => p.period.end !== 'ongoing').length
  };
};

export const getDepartmentHeadCount = (departments: Department[]): number => {
  return departments.reduce((count, dept) => count + dept.roles.length + 1, 0);
};

export const getKPIsByProgram = (kpis: KPI[], programName: string): string[] => {
  const program = kpis.find(k => k.program === programName);
  return program ? program.indicators : [];
};