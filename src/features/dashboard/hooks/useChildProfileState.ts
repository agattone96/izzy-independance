import { useState } from 'react';
import { useBoard } from '../../../store';
import { RECOMMENDED_CHORES } from '../../../data/recommendedChores';
import { User } from '../../../types/domain.types';

export const useChildProfileState = () => {
  const { tasks, addNewTask, updateUserProfile } = useBoard();

  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editChildName, setEditChildName] = useState('');
  const [editChildAvatar, setEditChildAvatar] = useState('');
  const [editChildAge, setEditChildAge] = useState<number | ''>('');
  const [editChildAgeGroup, setEditChildAgeGroup] = useState<'toddler' | 'preschool' | 'elementary' | 'teen'>('elementary');
  const [editChildPin, setEditChildPin] = useState('');
  const [saveProfileLoading, setSaveProfileLoading] = useState(false);
  const [saveProfileMessage, setSaveProfileMessage] = useState<string | null>(null);

  const handleStartEditChild = (child: User) => {
    setEditingChildId(child.id);
    setEditChildName(child.name);
    setEditChildAvatar(child.avatar || '👧');
    setEditChildAge((child as any).age || '');
    setEditChildAgeGroup((child as any).ageGroup || 'elementary');
    setEditChildPin(child.pin || '');
    setSaveProfileMessage(null);
  };

  const handleApplyAgeBasedChores = async (group: 'toddler' | 'preschool' | 'elementary' | 'teen') => {
    const recommendedChores = RECOMMENDED_CHORES[group];
    
    try {
      for (const chore of recommendedChores) {
        const exists = tasks.some(t => t.key === chore.key);
        if (!exists) {
          await addNewTask({
            key: chore.key,
            title: chore.title,
            category: chore.category,
            description: `Auto-generated age-suitable chore for ${group} profiles.`,
            pointValue: chore.pointValue,
            tabletBonusMinutes: chore.tabletBonusMinutes,
            dayOfWeek: "All",
            isDaily: true,
            isRequired: false,
            checklistItems: chore.checklistItems,
            sortOrder: tasks.length + 1,
            active: true
          });
        }
      }
      setSaveProfileMessage(`Success! Recommended ${group} habitual chores have been added as default templates! Check 'Manage Chores' tab.`);
    } catch (err: any) {
      setSaveProfileMessage(`Error adding chore templates: ${err.message}`);
    }
  };

  const handleSaveChildProfile = async (childId: string) => {
    if (!editChildName.trim()) return;
    setSaveProfileLoading(true);
    setSaveProfileMessage(null);
    try {
      await updateUserProfile(childId, {
        name: editChildName.trim(),
        avatar: editChildAvatar,
        age: editChildAge ? Number(editChildAge) : undefined,
        ageGroup: editChildAgeGroup,
        pin: editChildPin.trim() || undefined
      });
      setSaveProfileMessage("Success! Profile settings synced over live Firebase Cloud securely.");
      setTimeout(() => {
        setEditingChildId(null);
        setSaveProfileMessage(null);
      }, 2000);
    } catch (err: any) {
      setSaveProfileMessage(err.message || "Failed to sync updates.");
    } finally {
      setSaveProfileLoading(false);
    }
  };

  return {
    editingChildId,
    setEditingChildId,
    editChildName,
    setEditChildName,
    editChildAvatar,
    setEditChildAvatar,
    editChildAge,
    setEditChildAge,
    editChildAgeGroup,
    setEditChildAgeGroup,
    editChildPin,
    setEditChildPin,
    saveProfileLoading,
    saveProfileMessage,
    setSaveProfileMessage,
    handleStartEditChild,
    handleApplyAgeBasedChores,
    handleSaveChildProfile,
  };
};
