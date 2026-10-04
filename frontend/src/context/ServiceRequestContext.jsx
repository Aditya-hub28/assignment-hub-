import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const ServiceRequestContext = createContext(null);

const DEFAULT_FORM_DATA = {
  service: 'Assignment Writing',
  isCustom: false,
  customServiceName: '',
  title: '',
  subject: '',
  deadline: '',
  deadlineTime: '11:59 PM',
  description: '',
  additionalInstructions: '',
  serviceSpecific: {
    numberOfPages: '12 Pages (~3,000 words)',
    deliveryFormat: 'Typed (Doc/PDF)',
    techStack: 'Python, FastAPI, PostgreSQL, Docker',
    gitRepo: '',
    includeUnitTests: true,
    includeSetupDocs: true,
    slideCount: '15 Slides + Speaker Notes',
    slideFormat: 'PowerPoint (.pptx) & PDF Export',
    softwareTool: 'AutoCAD DWG',
    projectionMethod: 'First Angle',
    experimentType: 'Simulation / Practical Record',
    includeCalculations: true,
    domainArea: 'Computer Science & AI',
    targetJournalStandard: 'IEEE Academic Style'
  },
  files: []
};

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'zip', 'rar'];
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50 MB

export function ServiceRequestProvider({ children }) {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ah_service_form');
      return saved ? JSON.parse(saved) : DEFAULT_FORM_DATA;
    } catch {
      return DEFAULT_FORM_DATA;
    }
  });

  const [submittedRequest, setSubmittedRequest] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ah_submitted_request');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('ah_service_form', JSON.stringify(formData));
    } catch {
      // ignore
    }
  }, [formData]);

  useEffect(() => {
    try {
      if (submittedRequest) {
        sessionStorage.setItem('ah_submitted_request', JSON.stringify(submittedRequest));
      }
    } catch {
      // ignore
    }
  }, [submittedRequest]);

  const updateFormData = (updates) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
      serviceSpecific: {
        ...prev.serviceSpecific,
        ...(updates.serviceSpecific || {})
      }
    }));
  };

  const setService = (serviceName, isCustom = false) => {
    setFormData((prev) => ({
      ...prev,
      service: serviceName,
      isCustom,
      customServiceName: isCustom ? (prev.customServiceName || serviceName) : ''
    }));
  };

  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    const currentFiles = formData.files || [];
    let currentTotal = currentFiles.reduce((acc, f) => acc + (f.size || 0), 0);
    const validToAdd = [];

    for (const f of newFiles) {
      const ext = f.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        showToast(`"${f.name}" has an unsupported format. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`, 'error');
        continue;
      }

      if (currentTotal + f.size > MAX_TOTAL_SIZE) {
        showToast(`Cannot add "${f.name}". Total files exceed the 50 MB limit.`, 'error');
        break;
      }

      currentTotal += f.size;
      validToAdd.push({
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        extension: ext,
        lastModified: f.lastModified
      });
    }

    if (validToAdd.length > 0) {
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...validToAdd]
      }));
      showToast(`Added ${validToAdd.length} file${validToAdd.length > 1 ? 's' : ''}`, 'success');
    }
  };

  const removeFile = (fileName) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.name !== fileName)
    }));
  };

  const clearFiles = () => {
    setFormData((prev) => ({ ...prev, files: [] }));
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    sessionStorage.removeItem('ah_service_form');
  };

  const submitCurrentRequest = async () => {
    setIsSubmitting(true);
    try {
      // Format deadline date into ISO
      let deadlineIso = formData.deadline;
      if (formData.deadline) {
        try {
          const d = new Date(formData.deadline);
          if (!isNaN(d.getTime())) {
            deadlineIso = d.toISOString().split('T')[0];
          }
        } catch {
          // fallback
        }
      }

      if (!deadlineIso) {
        // default 3 days from now if omitted
        const def = new Date(Date.now() + 86400000 * 3);
        deadlineIso = def.toISOString().split('T')[0];
      }

      const payload = {
        service: formData.isCustom ? 'Custom Service' : formData.service,
        isCustom: !!formData.isCustom,
        customServiceName: formData.isCustom ? (formData.customServiceName || formData.title) : undefined,
        title: formData.title || (formData.isCustom ? formData.customServiceName : `${formData.service} Request`),
        subject: formData.subject || 'General Academic Coursework',
        description: formData.description || 'Full academic service delivery according to university criteria and guidelines.',
        deadline: deadlineIso,
        additionalInstructions: formData.additionalInstructions || '',
        serviceSpecific: formData.serviceSpecific,
        files: (formData.files || []).map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
          extension: f.extension
        })),
        userName: profile?.full_name || user?.user_metadata?.full_name || 'Student',
        userEmail: user?.email || ''
      };

      const res = await api.services.createRequest(payload);
      const created = res.data;
      setSubmittedRequest(created);
      showToast(`Request ${created.id} submitted successfully!`, 'success');
      return { success: true, data: created };
    } catch (err) {
      showToast(err.message || 'Failed to submit service request', 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ServiceRequestContext.Provider
      value={{
        formData,
        updateFormData,
        setService,
        addFiles,
        removeFile,
        clearFiles,
        resetForm,
        submittedRequest,
        setSubmittedRequest,
        submitCurrentRequest,
        isSubmitting
      }}
    >
      {children}
    </ServiceRequestContext.Provider>
  );
}

export function useServiceRequest() {
  const ctx = useContext(ServiceRequestContext);
  if (!ctx) {
    throw new Error('useServiceRequest must be used within a ServiceRequestProvider');
  }
  return ctx;
}
