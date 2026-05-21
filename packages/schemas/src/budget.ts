import { z } from "zod";

export const budgetProgramSchema = z.object({
  program_id: z.string(),
  program_name: z.string(),
  personnel_services: z.number(),
  mooe: z.number(),
  capital_outlays: z.number(),
  total: z.number(),
  performance_indicators: z.array(z.string()).optional(),
  special_provisions: z.array(z.string()).optional(),
  source_file: z.string().optional(),
  source_page: z.number().optional(),
  confidence_score: z.number().min(0).max(1).optional(),
});

export const budgetAgencySchema = z.object({
  agency_id: z.string(),
  agency_name: z.string(),
  category: z.string().optional(),
  office_category: z.string().optional(),
  programs: z.array(budgetProgramSchema),
  total_appropriation: z.number(),
  personnel_services: z.number().optional(),
  mooe: z.number().optional(),
  capital_outlays: z.number().optional(),
  source_file: z.string().optional(),
  source_page: z.number().optional(),
});

export const budgetYearSchema = z.object({
  fiscal_year: z.number(),
  act_number: z.string(),
  total_appropriation: z.number(),
  agencies: z.array(budgetAgencySchema),
  source_note: z.string().optional(),
  generated_at: z.string().optional(),
});

export type BudgetProgram = z.infer<typeof budgetProgramSchema>;
export type BudgetAgency = z.infer<typeof budgetAgencySchema>;
export type BudgetYear = z.infer<typeof budgetYearSchema>;
