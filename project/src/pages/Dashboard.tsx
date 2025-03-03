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

  const apiUrl = "http://127.0.0.1:8001";

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
    // Clean up the content
    content = content.replace(/\*+/g, "").trim();
    
    // Extract title if it exists at the beginning
    const titleMatch = content.match(/^([^\n]+)(?:\n|$)/);
    const title = titleMatch ? titleMatch[1].trim() : "Job Posting";
    
    // Create sections by identifying common headings
    let formattedContent = content
      // Transform headings - ensure title text is white
      .replace(/^(.*?)(?:(\n|^)(About the Role:|Job Description:|Overview:))/si, 
        "<h1 class='text-3xl font-bold text-white mb-6'>$1</h1><h2 class='text-2xl font-semibold text-purple-400 mb-4'>$3</h2>")
      // Handle case where there's a specific "Job Title:" prefix
      .replace(/(?:\n|^)(Job Title:)([^\n]+)/gi, 
        "<h1 class='text-3xl font-bold text-white mb-6'>$1$2</h1>")
      .replace(/(?:\n|^)(What We're Looking For:|Requirements:|Qualifications:|Skills Required:)/gi, 
        "<h2 class='text-2xl font-semibold text-purple-400 mt-8 mb-4'>$1</h2>")
      .replace(/(?:\n|^)(Benefits:|Perks:|What We Offer:|Compensation & Benefits:)/gi, 
        "<h2 class='text-2xl font-semibold text-purple-400 mt-8 mb-4'>$1</h2>")
      .replace(/(?:\n|^)(To Apply:|Application Process:|Next Steps:|How to Apply:)/gi, 
        "<h2 class='text-2xl font-semibold text-purple-400 mt-8 mb-4'>$1</h2>")
      
      // Handle bullet points with better spacing and icons
      .replace(/\n\s*•\s*/g, '</p><li class="flex items-start mb-3"><span class="text-purple-400 mr-2">•</span><span class="text-gray-300">')
      .replace(/\n\s*-\s*/g, '</p><li class="flex items-start mb-3"><span class="text-purple-400 mr-2">•</span><span class="text-gray-300">')
      
      // Handle paragraphs with proper spacing
      .replace(/\n\n+/g, '</p><p class="text-gray-300 mb-6">')
      .replace(/\n/g, '</p><p class="text-gray-300 mb-4">')
      
      // Convert square-bracketed terms to better-looking tags
      .replace(/\[([^\]]+)\]/g, '<span class="inline-block bg-purple-500/20 text-purple-200 px-3 py-1 rounded-md text-sm mr-2 mb-2 shadow-sm hover:bg-purple-500/30 transition-colors">$1</span>')
      
      // Add emphasis to important terms
      .replace(/(bonus|remote work|flexible hours|work from home|competitive salary)/gi, 
               '<span class="text-purple-300 font-medium">$1</span>')
      
      // Handle emojis with animation
      .replace(/🚀/g, '<span class="inline-block text-purple-400 transform hover:scale-110 transition-transform duration-200">🚀</span>')
      .replace(/💡/g, '<span class="inline-block text-yellow-400 transform hover:scale-110 transition-transform duration-200">💡</span>')
      .replace(/⭐/g, '<span class="inline-block text-yellow-400 transform hover:scale-110 transition-transform duration-200">⭐</span>')
      
      // Clean up any empty paragraphs
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/<li class="flex items-start mb-3"><span class="text-purple-400 mr-2">•<\/span><span class="text-gray-300"><\/span><\/li>/g, '');
  
    // Wrap bullet points in proper ul tags
    formattedContent = formattedContent.replace(
      /(<li class="flex items-start mb-3">.*?<\/li>)+/g,
      match => `<ul class="list-none ml-4 my-4">${match}</ul>`
    );
  
    // Ensure all spans in list items are closed
    formattedContent = formattedContent.replace(
      /<span class="text-gray-300">([^<]*?)(?=<\/li>|<li|$)/g,
      '<span class="text-gray-300">$1</span>'
    );
  
    // Apply final wrapper with better styling - removed submit application button
    return `
      <div class="job-post bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-xl p-8 border border-purple-500/10 mt-6 shadow-xl transition-all hover:shadow-purple-500/5">
        <div class="prose prose-invert max-w-none">
          ${formattedContent}
        </div>
        <div class="mt-8 border-t border-white/10 pt-6">
          <p class="text-gray-400 text-sm">Interested candidates, please follow the application instructions above.</p>
        </div>
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
      formData.append('jd', fileInput.files[0]);
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
      return `
        <div class="text-center p-10 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg mt-6">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 class="mt-2 text-lg font-medium text-purple-300">No data available</h3>
          <p class="mt-1 text-sm text-gray-400">Try uploading a different file or adjusting your search parameters.</p>
        </div>
      `;
    }
  
    const columns = Object.keys(jsonData[0]);
    const isNumeric = (val: any) => !isNaN(parseFloat(val)) && isFinite(val);
  
    // Function to format cell data based on content type
    const formatCellContent = (value: any, col: string) => {
      if (value === null || value === undefined) return '-';
      
      // Handle numbers with special formatting
      if (isNumeric(value)) {
        // For percentage columns
        if (col.toLowerCase().includes('percent') || col.toLowerCase().includes('rate')) {
          return `<span class="font-medium">${parseFloat(value).toFixed(1)}%</span>`;
        }
        // For score columns, add a visual indicator
        if (col.toLowerCase().includes('score') || col.toLowerCase().includes('rating')) {
          const score = parseFloat(value);
          const scoreClass = score > 80 ? 'text-green-400' : (score > 60 ? 'text-yellow-400' : 'text-red-400');
          return `<span class="${scoreClass} font-medium">${score.toFixed(1)}</span>`;
        }
      }
      
      // Highlight status columns
      if (col.toLowerCase() === 'status') {
        const statusClass = {
          'active': 'bg-green-500/20 text-green-300',
          'inactive': 'bg-gray-500/20 text-gray-300',
          'pending': 'bg-yellow-500/20 text-yellow-300',
          'rejected': 'bg-red-500/20 text-red-300',
          'approved': 'bg-green-500/20 text-green-300',
          'qualified': 'bg-purple-500/20 text-purple-300',
          'not qualified': 'bg-red-500/20 text-red-300',
        }[value.toString().toLowerCase()] || 'bg-blue-500/20 text-blue-300';
        
        return `<span class="px-2 py-1 rounded-full text-xs ${statusClass}">${value}</span>`;
      }
      
      // Format dates if detected
      if (typeof value === 'string' && 
          (value.match(/^\d{4}-\d{2}-\d{2}/) || value.match(/^\d{2}\/\d{2}\/\d{4}/))) {
        return `<span class="text-gray-400">${value}</span>`;
      }
      
      // Default text formatting
      return String(value);
    };
  
    return `
      <div class="overflow-x-auto mt-6 rounded-xl shadow-xl border border-white/10">
        <table class="min-w-full">
          <thead>
            <tr class="bg-gradient-to-r from-purple-900/50 to-gray-800/50 text-left">
              ${columns.map(col => `
                <th class="px-6 py-4 border-b border-white/20 text-sm font-medium text-purple-300 uppercase tracking-wider">
                  <span class="flex items-center">
                    ${col.replace(/_/g, ' ')}
                    <svg class="ml-1 w-4 h-4 text-gray-400 hover:text-purple-300 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </span>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10 bg-black/20 backdrop-blur-xl">
            ${jsonData.map((row, rowIndex) => `
              <tr class="transition-colors hover:bg-white/10">
                ${columns.map((col, colIndex) => {
                  const cellValue = formatCellContent(row[col], col);
                  // First column gets special styling
                  if (colIndex === 0) {
                    return `
                      <td class="pl-6 pr-3 py-4 text-sm font-medium text-purple-200 whitespace-nowrap">
                        ${cellValue}
                      </td>
                    `;
                  }
                  return `
                    <td class="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                      ${cellValue}
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="mt-3 text-right text-xs text-gray-400">
        Showing ${jsonData.length} result${jsonData.length !== 1 ? 's' : ''}
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