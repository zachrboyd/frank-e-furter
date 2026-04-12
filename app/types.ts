export interface Lead {
  id: number;
  defendant: string;
  website: string;
  industry: string;
  caseName: string;
  plaintiff: string;
  plaintiffFirm: string;
  court: string;
  courtId: string;
  docketNumber: string;
  dateFiled: string;
  docketUrl: string;
  confidenceScore: number;
  enterprise: boolean;
  verified: boolean;
  hasIronyBadge: boolean;
  whyItMatters: string;
  coldOpen: string;
  briefTheAE?: string;
}

export interface SerialFiler {
  name: string;
  casesThisMonth: number;
  typicalTargets: string;
  courts: string[];
}

export interface DistrictStat {
  court: string;
  courtId: string;
  cases: number;
}

export interface SeedData {
  lastUpdated: string;
  leads: Lead[];
  serialFilers: SerialFiler[];
  districtStats: DistrictStat[];
}
