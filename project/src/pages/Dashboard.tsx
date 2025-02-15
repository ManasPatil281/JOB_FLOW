import React, { useState } from 'react';
import { Phone, Send, Upload, FileText } from 'lucide-react';

interface Results {
  jobPost: string;
  jd: string;
  resume: string;
}

interface FormData {
  job_title: string;
  location: string;
  exp: string;
  salary_range: string;
  other_input: string;
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState('jobPost');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Results>({
    jobPost: '',
    jd: '',
    resume: ''
  });

  const apiUrl = "https://recruitment-385388557268.asia-south2.run.app";

  const handleJobPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData: FormData = {
      job_title: (form.querySelector('#jobTitle') as HTMLInputElement).value,
      location: (form.querySelector('#location') as HTMLInputElement).value,
      exp: (form.querySelector('#experience') as HTMLInputElement).value,
      salary_range: (form.querySelector('#salaryRange') as HTMLInputElement).value,
      other_input: (form.querySelector('#additionalDetails') as HTMLTextAreaElement).value,
    };

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/job_post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      const result = await response.json();

      const content = result.content || result;
      const formattedContent = formatJobPost(content);
      setResults(prev => ({
        ...prev,
        jobPost: formattedContent
      }));
    } catch (error) {
      console.error("Error:", error);
      setResults(prev => ({
        ...prev,
        jobPost: `<div class="text-red-400">Error: ${error}. Check console for details.</div>`
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const formatJobPost = (content: string) => {
    content = content.replace(/\*+/g, "").trim();
    return `
      <div class="job-post bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/10 mt-6">
        ${content
          .replace(/🚀/g, '<span class="text-purple-400">🚀</span>')
          .replace(/^(.*?)(About the Role:)/s, "<h2 class='text-2xl font-bold text-white mb-4'>$1</h2><h3 class='text-xl font-semibold text-purple-400 mb-3'>$2</h3>")
          .replace(/What We're Looking For:/, "<h3 class='text-xl font-semibold text-purple-400 mt-6 mb-3'>Key Requirements:</h3>")
          .replace(/Benefits:/, "<h3 class='text-xl font-semibold text-purple-400 mt-6 mb-3'>Benefits & Perks:</h3>")
          .replace(/To Apply:/, "<h3 class='text-xl font-semibold text-purple-400 mt-6 mb-3'>Application Process:</h3>")
          .replace(/\[([^\]]+)\]/g, '<span class="inline-block bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md text-sm mr-2 mb-2">$1</span>')
          .replace(/\n\s*•\s*/g, '</p><li class="text-gray-300 mb-2">')
          .replace(/\n/g, '</p><p class="text-gray-300 mb-4">')
          .replace(/<p>\s*<\/p>/g, '')}
      </div>
    `;
  };

  const handleFileUpload = async (e: React.FormEvent, endpoint: string) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData();

    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert('Please select a file');
      setIsLoading(false);
      return;
    }

    // FIX: Correct the file field name based on the endpoint
    if (endpoint === 'process-resumes') {
      Array.from(fileInput.files).forEach((file) => {
        formData.append('files', file);
      });
    } else {
      // FIX: Use 'file' instead of 'jd' to match backend expectation
      formData.append('file', fileInput.files[0]);
    }

    try {
      const response = await fetch(`${apiUrl}/${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (endpoint === 'process-resumes') {
        setResults(prev => ({
          ...prev,
          resume: jsonToTable(result)
        }));
      } else {
        // FIX: Handle the job description response correctly
        const jdText = result.job_description || "Job description uploaded successfully";
        setResults(prev => ({
          ...prev,
          jd: `
            <div class="mt-4 p-4 bg-white/5 rounded-lg">
              <h3 class="text-xl font-semibold text-purple-400 mb-3">Extracted Job Description Successfully</h3>
            </div>
          `
        }));
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Error uploading file: ${error.message}`);
    } finally {
      setIsLoading(false);
      form.reset();
    }
  };

  const jsonToTable = (jsonData: any[]) => {
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return '<div class="text-center text-gray-300 mt-6">No data available</div>';
    }

    const columns = Object.keys(jsonData[0]);
    return `
      <div class="overflow-x-auto mt-6">
        <table class="min-w-full bg-white/5 backdrop-blur-xl rounded-xl">
          <thead>
            <tr>
              ${columns.map(col => `
                <th class="px-6 py-3 border-b border-white/10 bg-white/5 text-left text-xs leading-4 font-medium text-purple-300 uppercase tracking-wider">
                  ${col}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            ${jsonData.map(row => `
              <tr class="hover:bg-white/5">
                ${columns.map(col => `
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    ${row[col]}
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const handleWhatsAppConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const numberInput = document.getElementById("number") as HTMLInputElement;
    const phoneNumber = numberInput.value.replace(/\D/g, '');

    if (phoneNumber.length >= 10) {
      const formattedNumber = phoneNumber.length === 10 ? `91${phoneNumber}` : phoneNumber;
      window.open(`https://wa.me/${formattedNumber}`, '_blank');
    } else {
      alert('Please enter a valid phone number');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('jobPost')}
            className={`flex items-center px-6 py-4 focus:outline-none transition-colors ${
              activeTab === 'jobPost'
                ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-5 h-5 mr-2" />
            Create Job Post
          </button>
          <button
            onClick={() => setActiveTab('uploadJD')}
            className={`flex items-center px-6 py-4 focus:outline-none transition-colors ${
              activeTab === 'uploadJD'
                ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload JD
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex items-center px-6 py-4 focus:outline-none transition-colors ${
              activeTab === 'resume'
                ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-5 h-5 mr-2" />
            Process Resumes
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center px-6 py-4 focus:outline-none transition-colors ${
              activeTab === 'whatsapp'
                ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Phone className="w-5 h-5 mr-2" />
            WhatsApp Connect
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'jobPost' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Create Job Post</h2>
             <form onSubmit={handleJobPostSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-300">
                      Job Title
                    </label>
                    <input
                      type="text"
                      id="jobTitle"
                      className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-300">
                      Experience Required
                    </label>
                    <input
                      type="text"
                      id="experience"
                      className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. 3-5 years"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-300">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. New York, NY"
                    />
                  </div>
                  <div>
                    <label htmlFor="salaryRange" className="block text-sm font-medium text-gray-300">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      id="salaryRange"
                      className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. $100,000 - $150,000"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-300">
                    Additional Details
                  </label>
                  <textarea
                    id="additionalDetails"
                    rows={4}
                    className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter job description, requirements, and other details..."
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Generate Job Post
                    </>
                  )}
                </button>
              </form>
              {results.jobPost && (
                <div dangerouslySetInnerHTML={{ __html: results.jobPost }} />
              )}
            </div>
          )}

          {activeTab === 'uploadJD' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Upload Job Description</h2>
              <form onSubmit={(e) => handleFileUpload(e, 'jd')} className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer border-white/10 bg-white/5 hover:bg-white/10">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">PDF, DOC, or DOCX (MAX. 10MB)</p>
                    </div>
                    <input type="file" className="hidden" name="file" accept=".pdf,.doc,.docx" />
                  </label>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload JD
                    </>
                  )}
                </button>
              </form>
              {results.jd && (
                <div dangerouslySetInnerHTML={{ __html: results.jd }} />
              )}
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Process Resumes</h2>
               <form onSubmit={(e) => handleFileUpload(e, 'process-resumes')} className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer border-white/10 bg-white/5 hover:bg-white/10">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">PDF, DOC, or DOCX (MAX. 10MB)</p>
                    </div>
                    <input type="file" className="hidden" name="files" accept=".pdf,.doc,.docx" multiple />
                  </label>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2" />
                      Process Resumes
                    </>
                  )}
                </button>
              </form>
              {results.resume && (
                <div dangerouslySetInnerHTML={{ __html: results.resume }} />
              )}
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">WhatsApp Connect</h2>
              <form onSubmit={handleWhatsAppConnect} className="space-y-4">
                <div>
                  <label htmlFor="number" className="block text-sm font-medium text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="number"
                    className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Connect on WhatsApp
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Dashboard;