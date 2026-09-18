import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Assignment, Subject, AssignmentSubmission } from '../types';
import { Modal } from '../components/common/Modal';
import {
  BookOpen,
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Trash2,
  Filter,
  Download,
  Users,
  FileCheck,
  X
} from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const { currentUser, isStudent, isFaculty, isAdmin } = useAuth();
  const { refreshKey, triggerRefresh, showToast } = useApp();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted'>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');

  // Create Assignment Modal (Faculty)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newMaxMarks, setNewMaxMarks] = useState(25);
  const [newDescription, setNewDescription] = useState('');

  // Submit Assignment Modal (Student)
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Faculty View Submissions Modal
  const [viewingSubmissionsAssignment, setViewingSubmissionsAssignment] = useState<Assignment | null>(null);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>([]);

  useEffect(() => {
    if (isStudent) {
      setAssignments(api.getAssignments(currentUser));
      const subjs = api.getSubjects(currentUser);
      setSubjects(subjs);
      if (subjs.length > 0 && !newSubjectId) {
        setNewSubjectId(subjs[0].id);
      }
    } else {
      setAssignments(api.getAssignments());
      const subjs = api.getSubjects();
      setSubjects(subjs);
      if (subjs.length > 0 && !newSubjectId) {
        setNewSubjectId(subjs[0].id);
      }
    }
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setNewDueDate(nextWeek.toISOString().split('T')[0]);
  }, [currentUser, isStudent, refreshKey]);

  // Load submissions when viewing modal opens
  useEffect(() => {
    if (viewingSubmissionsAssignment) {
      const subs = api.getAssignmentSubmissions(viewingSubmissionsAssignment.id);
      setAssignmentSubmissions(subs);
    } else {
      setAssignmentSubmissions([]);
    }
  }, [viewingSubmissionsAssignment, refreshKey]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleOpenSubmitModal = (asg: Assignment) => {
    setSubmittingAssignment(asg);
    setSelectedFile(null);
    setFileError(null);
    setSubmissionNotes('');
    setIsUploading(false);
    setIsDragging(false);
  };

  const handleCloseSubmitModal = () => {
    setSubmittingAssignment(null);
    setSelectedFile(null);
    setFileError(null);
    setSubmissionNotes('');
    setIsUploading(false);
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateAndSetFile = (file: File | null) => {
    setFileError(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // PDF format verification
    const fileName = file.name.trim();
    const isPdfExt = fileName.toLowerCase().endsWith('.pdf');
    const isPdfMime = file.type === 'application/pdf';

    if (!isPdfExt && !isPdfMime) {
      setSelectedFile(null);
      setFileError(`Invalid file format "${file.name}". Only PDF (.pdf) files are accepted.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Size limit verification: 20MB max
    if (file.size > 20 * 1024 * 1024) {
      setSelectedFile(null);
      setFileError(`File size (${formatFileSize(file.size)}) exceeds the 20 MB limit.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
    validateAndSetFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    if (!selectedFile) {
      setFileError('Please select a PDF file before submitting.');
      return;
    }

    const isPdf = selectedFile.name.toLowerCase().endsWith('.pdf') || selectedFile.type === 'application/pdf';
    if (!isPdf) {
      setFileError('Invalid file format. Only .pdf files are accepted for assignment submission.');
      return;
    }

    setIsUploading(true);

    try {
      // Read file into Base64 Data URL
      const fileDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read the selected PDF file.'));
        reader.readAsDataURL(selectedFile);
      });

      api.submitAssignmentWithFile(submittingAssignment.id, currentUser, {
        fileName: selectedFile.name,
        fileSize: formatFileSize(selectedFile.size),
        fileType: 'application/pdf',
        fileData: fileDataUrl,
        comment: submissionNotes.trim() || undefined
      });

      triggerRefresh();
      showToast({
        type: 'success',
        title: 'Assignment Submitted',
        message: `Your solution "${selectedFile.name}" was uploaded successfully.`
      });

      handleCloseSubmitModal();
    } catch (err: any) {
      setFileError(err.message || 'Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const handleDownloadPdf = (submission: { fileName: string; fileData?: string; studentName?: string }) => {
    const rawFileName = submission.fileName || 'Assignment_Submission.pdf';
    const fileName = rawFileName.toLowerCase().endsWith('.pdf') ? rawFileName : `${rawFileName}.pdf`;

    if (submission.fileData && submission.fileData.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = submission.fileData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Clean PDF Blob generation for seed/sample submissions
      const sampleContent = `%PDF-1.4\n1 0 obj\n<< /Title (${fileName}) /Author (${submission.studentName || 'Student'}) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
      const blob = new Blob([sampleContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      showToast({
        type: 'warning',
        title: 'Missing Details',
        message: 'Please fill in assignment title and description.'
      });
      return;
    }

    const sub = subjects.find(s => s.id === newSubjectId);
    api.createAssignment({
      title: newTitle.trim(),
      subjectId: newSubjectId,
      subjectName: sub ? `${sub.code}: ${sub.name}` : 'Computer Science',
      dueDate: newDueDate,
      maxMarks: Number(newMaxMarks),
      description: newDescription.trim(),
      createdBy: currentUser.id,
      branch: sub?.branch || (currentUser.department ? currentUser.department : 'CSE'),
      semester: sub?.semester || '6th Semester',
      year: '3rd Year'
    });

    triggerRefresh();
    showToast({
      type: 'success',
      title: 'Assignment Published',
      message: `Assignment "${newTitle}" has been posted to all enrolled students.`
    });

    setNewTitle('');
    setNewDescription('');
    setIsCreateOpen(false);
  };

  const handleDeleteAssignment = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete assignment "${title}"?`)) {
      api.deleteAssignment(id);
      triggerRefresh();
      showToast({
        type: 'info',
        title: 'Assignment Deleted',
        message: 'The assignment was successfully removed.'
      });
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (filter === 'pending' && a.isSubmitted) return false;
    if (filter === 'submitted' && !a.isSubmitted) return false;
    if (selectedSubjectFilter !== 'all' && a.subjectId !== selectedSubjectFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
            Academics
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1 font-sans">
            Assignments & Coursework
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isFaculty || isAdmin
              ? 'Create course assignments and evaluate student submissions.'
              : 'Submit your homework, lab tasks, and research assignments on time.'}
          </p>
        </div>

        {(isFaculty || isAdmin) && (
          <button
            id="faculty-create-assignment-btn"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({assignments.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filter === 'pending'
                ? 'bg-amber-100 text-amber-900'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending ({assignments.filter(a => !a.isSubmitted).length})
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filter === 'submitted'
                ? 'bg-emerald-100 text-emerald-900'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Submitted ({assignments.filter(a => a.isSubmitted).length})
          </button>
        </div>

        {/* Subject dropdown filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedSubjectFilter}
            onChange={e => setSelectedSubjectFilter(e.target.value)}
            className="p-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code}: {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-3">
        {filteredAssignments.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No assignments match the selected filter.
          </div>
        ) : (
          filteredAssignments.map(asg => {
            const isDueSoon = new Date(asg.dueDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
            return (
              <div
                key={asg.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      {asg.subjectName}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        asg.isSubmitted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isDueSoon
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {asg.isSubmitted ? 'Submitted ✓' : isDueSoon ? 'Due Soon ⏳' : 'Not Submitted'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Max Marks: {asg.maxMarks || asg.totalMarks}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {asg.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {asg.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Due Date: <strong className="text-slate-700">{asg.dueDate}</strong>
                    </span>
                  </div>

                  {/* Student View: Submitted PDF Banner */}
                  {isStudent && asg.isSubmitted && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700 font-bold text-[10px]">
                          PDF
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-800 text-xs truncate max-w-xs sm:max-w-md">
                              {asg.mySubmission?.fileName || 'Assignment_Submission.pdf'}
                            </span>
                            {asg.mySubmission?.fileSize && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {asg.mySubmission.fileSize}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Submitted on {asg.submittedAt ? new Date(asg.submittedAt).toLocaleString() : 'Recently'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(asg.mySubmission || {
                            fileName: asg.mySubmission?.fileName || `${asg.title}.pdf`,
                            studentName: currentUser.name
                          })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
                          title="View / Download submitted PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenSubmitModal(asg)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
                          title="Replace or re-upload your PDF file"
                        >
                          <span>Replace PDF</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
                  {isFaculty || isAdmin ? (
                    <div className="flex items-center gap-2">
                      <button
                        id={`view-submissions-btn-${asg.id}`}
                        onClick={() => setViewingSubmissionsAssignment(asg)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 text-xs font-semibold transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Submissions ({asg.submissionsCount || 0})</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(asg.id, asg.title)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    !asg.isSubmitted && (
                      <button
                        id={`submit-asg-${asg.id}`}
                        onClick={() => handleOpenSubmitModal(asg)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white transition-all active:scale-98"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit Assignment</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* STUDENT SUBMISSION MODAL (Requires actual PDF upload before submission) */}
      {submittingAssignment && (
        <Modal
          isOpen={!!submittingAssignment}
          onClose={handleCloseSubmitModal}
          title="Submit Assignment"
          subtitle={`${submittingAssignment.subjectName} • Due: ${submittingAssignment.dueDate}`}
          maxWidth="md"
        >
          <form onSubmit={handleUploadAndSubmit} className="space-y-4">
            {/* Assignment Details Recap */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">{submittingAssignment.title}</p>
              <p className="text-slate-600 line-clamp-2">{submittingAssignment.description}</p>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                <span>Max Marks: <strong className="text-slate-700">{submittingAssignment.maxMarks || submittingAssignment.totalMarks}</strong></span>
                <span>Due Date: <strong className="text-slate-700">{submittingAssignment.dueDate}</strong></span>
              </div>
            </div>

            {/* Required Format Banner */}
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Format Requirement:</strong> PDF format (.pdf) only. Non-PDF files (images, Word docs, zip archives) will be rejected.
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* File Picker / Drag & Drop Area */}
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/30'
                }`}
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Click to select assignment PDF or drag and drop
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Accepts only PDF documents (up to 20 MB)
                </p>
                <button
                  type="button"
                  id="browse-assignment-pdf-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Choose PDF File</span>
                </button>
              </div>
            ) : (
              /* Selected PDF File Card */
              <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 font-bold text-xs">
                      PDF
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs">{selectedFile.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          PDF Verified ✓
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Size: <strong className="text-slate-700">{formatFileSize(selectedFile.size)}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFileError(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-800 font-medium">
                    Ready to upload and submit
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline"
                  >
                    Change File
                  </button>
                </div>
              </div>
            )}

            {/* Error Message if invalid file */}
            {fileError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{fileError}</span>
              </div>
            )}

            {/* Optional Submission Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Notes for Faculty
              </label>
              <textarea
                rows={2}
                value={submissionNotes}
                onChange={e => setSubmissionNotes(e.target.value)}
                placeholder="Add any specific comments or note about your submission..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCloseSubmitModal}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="confirm-upload-submit-btn"
                disabled={!selectedFile || isUploading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileCheck className="w-4 h-4" />
                <span>{isUploading ? 'Uploading PDF...' : 'Upload & Submit'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* FACULTY VIEW SUBMISSIONS MODAL */}
      {viewingSubmissionsAssignment && (
        <Modal
          isOpen={!!viewingSubmissionsAssignment}
          onClose={() => setViewingSubmissionsAssignment(null)}
          title={`Student Submissions: ${viewingSubmissionsAssignment.title}`}
          subtitle={`${viewingSubmissionsAssignment.subjectName} • Due: ${viewingSubmissionsAssignment.dueDate}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
              <span>Total Submissions: <strong className="text-slate-900">{assignmentSubmissions.length}</strong></span>
              <span>Max Marks: <strong className="text-slate-900">{viewingSubmissionsAssignment.maxMarks || viewingSubmissionsAssignment.totalMarks}</strong></span>
            </div>

            {assignmentSubmissions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No student has submitted a PDF for this assignment yet.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {assignmentSubmissions.map(sub => (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{sub.studentName}</span>
                        {sub.studentRoll && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {sub.studentRoll}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Submitted
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">{sub.fileName}</span>
                        {sub.fileSize && <span>({sub.fileSize})</span>}
                        <span>•</span>
                        <span>{new Date(sub.submittedAt).toLocaleString()}</span>
                      </div>
                      {sub.comment && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100 mt-1">
                          "{sub.comment}"
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(sub)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 self-end sm:self-center"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingSubmissionsAssignment(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Assignment Modal for Faculty */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Post New Assignment"
        subtitle="Assignment will automatically reflect on enrolled student dashboards."
        maxWidth="md"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assignment Title
            </label>
            <input
              id="faculty-asg-title-input"
              type="text"
              required
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Lab 4: B+ Tree Indexing & Query Plans"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject
              </label>
              <select
                value={newSubjectId}
                onChange={e => setNewSubjectId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Marks
              </label>
              <input
                type="number"
                min={5}
                max={100}
                value={newMaxMarks}
                onChange={e => setNewMaxMarks(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Submission Due Date
            </label>
            <input
              type="date"
              required
              value={newDueDate}
              onChange={e => setNewDueDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instructions & Specification
            </label>
            <textarea
              required
              rows={3}
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="Describe deliverables, submission requirements (.pdf)..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="faculty-publish-asg-submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Publish Assignment</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
