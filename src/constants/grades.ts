export interface GradeOption {
  value: string;
  label: string;
}

// Full KG–12 range — use this everywhere a grade dropdown is needed
export const GRADES: GradeOption[] = [
  { value: 'kg1',     label: 'Kindergarten 1' },
  { value: 'kg2',     label: 'Kindergarten 2' },
  { value: 'grade1',  label: 'Grade 1' },
  { value: 'grade2',  label: 'Grade 2' },
  { value: 'grade3',  label: 'Grade 3' },
  { value: 'grade4',  label: 'Grade 4' },
  { value: 'grade5',  label: 'Grade 5' },
  { value: 'grade6',  label: 'Grade 6' },
  { value: 'grade7',  label: 'Grade 7' },
  { value: 'grade8',  label: 'Grade 8' },
  { value: 'grade9',  label: 'Grade 9' },
  { value: 'grade10', label: 'Grade 10' },
  { value: 'grade11', label: 'Grade 11' },
  { value: 'grade12', label: 'Grade 12' },
];