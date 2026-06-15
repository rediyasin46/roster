import { useEffect, useState } from 'react';
import { Edit2 } from 'lucide-react';
import { useMarkbook } from '@/context/MarkbookContext';
import { SchoolInfo } from '@/types/markbook';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

type EditableSchoolFields = Pick<SchoolInfo, 'school' | 'year' | 'grade' | 'section' | 'teacher'>;

const emptyForm = (): EditableSchoolFields => ({
  school: '',
  year: '',
  grade: '',
  section: '',
  teacher: '',
});

function formFromSchoolInfo(info: SchoolInfo): EditableSchoolFields {
  return {
    school: info.school || '',
    year: info.year || '',
    grade: info.grade || '',
    section: info.section || '',
    teacher: info.teacher || '',
  };
}

interface SchoolInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SchoolInfoDialog({ open, onOpenChange }: SchoolInfoDialogProps) {
  const { state, dispatch } = useMarkbook();
  const { schoolInfo, subjects, students } = state;
  const { toast } = useToast();
  const [form, setForm] = useState<EditableSchoolFields>(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(formFromSchoolInfo(schoolInfo));
    }
  }, [open, schoolInfo]);

  const updateField = (field: keyof EditableSchoolFields, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setForm(formFromSchoolInfo(schoolInfo));
    onOpenChange(false);
  };

  const handleSave = () => {
    if (!form.school.trim()) {
      toast({
        title: 'School name required',
        description: 'Please enter the school name.',
        variant: 'destructive',
      });
      return;
    }

    dispatch({
      type: 'SET_SCHOOL_INFO',
      payload: {
        school: form.school.trim(),
        year: form.year.trim(),
        grade: form.grade.trim(),
        section: form.section.trim(),
        teacher: form.teacher.trim(),
      },
    });

    toast({
      title: 'School information saved',
      description: 'Your school details have been updated.',
    });
    onOpenChange(false);
  };

  const fields: { key: keyof EditableSchoolFields; label: string; placeholder: string }[] = [
    { key: 'school', label: 'School', placeholder: 'e.g. Afran' },
    { key: 'year', label: 'Year', placeholder: 'e.g. 2018' },
    { key: 'grade', label: 'Grade', placeholder: 'e.g. 8' },
    { key: 'section', label: 'Section', placeholder: 'e.g. A' },
    { key: 'teacher', label: 'Teacher', placeholder: 'e.g. Ms. Elfo' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit School Information</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                {label}:
              </label>
              <Input
                value={form[key]}
                onChange={(e) => updateField(key, e.target.value)}
                placeholder={placeholder}
                className="bg-background"
              />
            </div>
          ))}

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              No. Subject:
            </label>
            <div className="px-3 py-2 bg-muted rounded-md font-medium text-sm">
              {subjects.length}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              No. Student:
            </label>
            <div className="px-3 py-2 bg-muted rounded-md font-medium text-sm">
              {students.length}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SchoolInfoSummaryProps {
  onEdit: () => void;
}

export function SchoolInfoSummary({ onEdit }: SchoolInfoSummaryProps) {
  const { state } = useMarkbook();
  const { schoolInfo, subjects, students } = state;

  const displayValue = (value?: string) => value?.trim() || '—';

  const items = [
    { label: 'School', value: displayValue(schoolInfo.school) },
    { label: 'Year', value: displayValue(schoolInfo.year) },
    { label: 'Grade', value: displayValue(schoolInfo.grade) },
    { label: 'Section', value: displayValue(schoolInfo.section) },
    { label: 'Teacher', value: displayValue(schoolInfo.teacher) },
    { label: 'No. Subject', value: String(subjects.length) },
    { label: 'No. Student', value: String(students.length) },
  ];

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 flex-1">
        {items.map(({ label, value }) => (
          <div key={label}>
            <label className="text-xs font-medium text-muted-foreground">{label}:</label>
            <div className="px-3 py-2 bg-gray-200 dark:bg-slate-700 dark:text-slate-100 rounded font-medium text-sm mt-0.5">
              {value}
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onEdit}
        className="gap-2 shrink-0"
      >
        <Edit2 className="w-4 h-4" />
        Edit
      </Button>
    </div>
  );
}
