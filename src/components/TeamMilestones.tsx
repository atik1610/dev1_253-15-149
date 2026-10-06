import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Plus, 
  Award, 
  Clock, 
  CheckCircle2, 
  UserPlus, 
  Briefcase
} from 'lucide-react';
import { KeyPersonnel, Language, Milestone, TenderProposal } from '../types/tender';

interface TeamMilestonesProps {
  tender: TenderProposal;
  lang: Language;
  onUpdatePersonnel: (personnel: KeyPersonnel[]) => void;
  onUpdateMilestones: (milestones: Milestone[]) => void;
}

export const TeamMilestones: React.FC<TeamMilestonesProps> = ({
  tender,
  lang,
  onUpdatePersonnel,
  onUpdateMilestones,
}) => {
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [newPerson, setNewPerson] = useState<Partial<KeyPersonnel>>({
    name: '',
    role: '',
    yearsOfExp: 8,
    certifications: ['PMP'],
    allocatedCommitment: '100% Full-time',
  });
  const [certInput, setCertInput] = useState('PMP, TOGAF');

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerson.name || !newPerson.role) return;

    const certs = certInput.split(',').map((c) => c.trim()).filter(Boolean);
    const created: KeyPersonnel = {
      id: `p-${Date.now()}`,
      name: newPerson.name,
      role: newPerson.role,
      yearsOfExp: Number(newPerson.yearsOfExp) || 5,
      certifications: certs,
      allocatedCommitment: newPerson.allocatedCommitment || '100% Dedicated',
    };

    onUpdatePersonnel([...tender.personnel, created]);
    setNewPerson({
      name: '',
      role: '',
      yearsOfExp: 8,
      allocatedCommitment: '100% Full-time',
    });
    setIsAddingPerson(false);
  };

  const totalWeeks = tender.milestones.reduce((acc, m) => acc + m.durationWeeks, 0);

  return (
    <div className="space-y-8">
      {/* Key Personnel Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-950 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-700" />
              {lang === 'bn' ? 'মূল কারিগরি জনবল ও বিশেষজ্ঞ প্যানেল' : 'Key Technical Personnel & Staffing Matrix'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'bn' ? 'দরপত্রের শর্তানুযায়ী প্রজেক্ট ম্যানেজার ও প্রধান প্রকৌশলীদের অভিজ্ঞতা' : 'PMP certified Project Managers and domain experts evaluated for technical scoring'}
            </p>
          </div>

          <button
            onClick={() => setIsAddingPerson(!isAddingPerson)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-1.5 px-3"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'বিশেষজ্ঞ যুক্ত করুন' : 'Add Team Expert'}</span>
          </button>
        </div>

        {/* Add Person Drawer */}
        {isAddingPerson && (
          <form onSubmit={handleAddPerson} className="bg-slate-50 p-4 border border-slate-300 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-900 uppercase tracking-wider">
                {lang === 'bn' ? 'নতুন বিশেষজ্ঞ প্রোফাইল' : 'New Specialist Profile'}
              </span>
              <button
                type="button"
                onClick={() => setIsAddingPerson(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'নাম' : 'Full Name'}</label>
                <input
                  type="text"
                  required
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  placeholder="e.g. Engr. Asaduzzaman, PMP"
                  className="w-full bg-white border border-slate-300 px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'দায়িত্ব / পদবী' : 'Designated Tender Role'}</label>
                <input
                  type="text"
                  required
                  value={newPerson.role}
                  onChange={(e) => setNewPerson({ ...newPerson, role: e.target.value })}
                  placeholder="e.g. Lead Solution Architect"
                  className="w-full bg-white border border-slate-300 px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'অভিজ্ঞতা (বছর)' : 'Years of Experience'}</label>
                <input
                  type="number"
                  min="1"
                  value={newPerson.yearsOfExp}
                  onChange={(e) => setNewPerson({ ...newPerson, yearsOfExp: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 px-2.5 py-1.5 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'সার্টিফিকেশন (কমা দিয়ে পৃথক করুন)' : 'Certifications (comma separated)'}</label>
              <input
                type="text"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                placeholder="PMP, CISSP, TOGAF"
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-1.5 px-4"
              >
                {lang === 'bn' ? 'প্রোফাইল যোগ করুন' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tender.personnel.map((person) => (
            <div key={person.id} className="bg-white p-4 border border-slate-200 hover:border-slate-300">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-950 text-sm">{person.name}</h4>
                  <p className="text-xs font-medium text-slate-700 mt-0.5">{person.role}</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 border border-slate-200">
                  {person.yearsOfExp} yrs exp
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {person.certifications.map((cert, idx) => (
                  <span key={idx} className="text-[11px] font-mono text-slate-700 bg-slate-50 border border-slate-200 px-1.5 py-0.5">
                    {cert}
                  </span>
                ))}
              </div>

              <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>{person.allocatedCommitment}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Delivery Milestones Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h3 className="text-base font-semibold text-slate-950 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-700" />
            {lang === 'bn' ? 'প্রকল্প বাস্তবায়ন সময়সূচি ও মাইলস্টোন' : 'Project Implementation Schedule & Milestones'}
          </h3>
          <p className="text-xs text-slate-500">
            {lang === 'bn' ? `মোট প্রকল্প মেয়াদ: ${totalWeeks} সপ্তাহ (${(totalWeeks / 4.3).toFixed(1)} মাস)` : `Total project duration: ${totalWeeks} weeks (~${(totalWeeks / 4.3).toFixed(1)} months)`}
          </p>
        </div>

        <div className="border border-slate-200 divide-y divide-slate-200 bg-white text-xs">
          {tender.milestones.map((m, idx) => (
            <div key={m.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 border border-slate-200">
                    Phase {idx + 1}
                  </span>
                  <h4 className="font-semibold text-slate-950">{m.title}</h4>
                </div>
                <p className="text-slate-600">
                  <span className="font-medium text-slate-800">Deliverables: </span>
                  {m.deliverables}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0 font-mono">
                <div className="text-right">
                  <span className="font-bold text-slate-900">{m.durationWeeks} Wks</span>
                  <span className="text-[11px] text-slate-500 block">Duration</span>
                </div>
                <div className="w-24">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{m.completionPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5">
                    <div className="bg-slate-900 h-1.5" style={{ width: `${m.completionPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
