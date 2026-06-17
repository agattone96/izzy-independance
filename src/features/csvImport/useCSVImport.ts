import React, { useState, useRef } from 'react';
import { useBoard } from '../../store';
import { TASK_CSV_TEMPLATE, REWARD_CSV_TEMPLATE } from '../../data/csvTemplates';
import { parseTasksCSVText, parseRewardsCSVText } from './csvParser';
import { Task, Reward } from '../../types/domain.types';

export const useCSVImport = () => {
  const { importCSVTasks, importCSVRewards } = useBoard();

  // Section states
  const [taskFile, setTaskFile] = useState<File | null>(null);
  const [rewardFile, setRewardFile] = useState<File | null>(null);
  const [taskPreview, setTaskPreview] = useState<any[]>([]);
  const [rewardPreview, setRewardPreview] = useState<any[]>([]);
  const [taskErrors, setTaskErrors] = useState<string[]>([]);
  const [rewardErrors, setRewardErrors] = useState<string[]>([]);

  // Settings
  const [taskImportMode, setTaskImportMode] = useState<'update' | 'overwrite'>('update');
  const [rewardImportMode, setRewardImportMode] = useState<'update' | 'overwrite'>('update');
  const [importResult, setImportResult] = useState<{ type: 'tasks' | 'rewards'; count: number } | null>(null);

  const taskInputRef = useRef<HTMLInputElement>(null);
  const rewardInputRef = useRef<HTMLInputElement>(null);

  // Downloads templates
  const downloadTaskTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + TASK_CSV_TEMPLATE;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tasks_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadRewardTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + REWARD_CSV_TEMPLATE;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "rewards_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handlers Task Import
  const handleTaskUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTaskFile(file);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { parsedRecords, errors } = parseTasksCSVText(text);
      setTaskErrors(errors);
      setTaskPreview(parsedRecords);
    };
    reader.readAsText(file);
  };

  // Handlers Reward Import
  const handleRewardUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRewardFile(file);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { parsedRecords, errors } = parseRewardsCSVText(text);
      setRewardErrors(errors);
      setRewardPreview(parsedRecords);
    };
    reader.readAsText(file);
  };

  // Confirm Task Import (re-wired to await Promise)
  const confirmTaskImport = async () => {
    if (taskErrors.length > 0 || taskPreview.length === 0) return;
    const result = await importCSVTasks(taskPreview, taskImportMode);

    if (result.errors && result.errors.length > 0) {
      setTaskErrors(result.errors);
    } else {
      setImportResult({ type: 'tasks', count: result.importedCount });
      // Reset
      setTaskFile(null);
      setTaskPreview([]);
      if (taskInputRef.current) taskInputRef.current.value = '';
    }
  };

  // Confirm Reward Import (re-wired to await Promise)
  const confirmRewardImport = async () => {
    if (rewardErrors.length > 0 || rewardPreview.length === 0) return;
    const result = await importCSVRewards(rewardPreview, rewardImportMode);

    if (result.errors && result.errors.length > 0) {
      setRewardErrors(result.errors);
    } else {
      setImportResult({ type: 'rewards', count: result.importedCount });
      // Reset
      setRewardFile(null);
      setRewardPreview([]);
      if (rewardInputRef.current) rewardInputRef.current.value = '';
    }
  };

  return {
    taskFile,
    rewardFile,
    taskPreview,
    rewardPreview,
    taskErrors,
    rewardErrors,
    taskImportMode,
    setTaskImportMode,
    rewardImportMode,
    setRewardImportMode,
    importResult,
    taskInputRef,
    rewardInputRef,
    downloadTaskTemplate,
    downloadRewardTemplate,
    handleTaskUploadChange,
    handleRewardUploadChange,
    confirmTaskImport,
    confirmRewardImport,
  };
};
